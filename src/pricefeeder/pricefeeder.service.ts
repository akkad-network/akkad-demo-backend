import * as dotenv from 'dotenv'
dotenv.config()
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AptFeeder, aptos, AvaxFeeder, BnbFeeder, BtcFeeder, DogeFeeder, EthFeeder, executerSigner, FEERDER_ADDRESS, MODULE_ADDRESS, PepeFeeder, priceFeederSyncerSigner, SolFeeder, StAptFeeder, UsdcFeeder, UsdtFeeder } from 'src/main';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScannerService } from 'src/scanner/scanner.service';
import { SymbolList } from 'src/utils/helper';
import { PriceFeederRecord } from '@prisma/client';

@Injectable()
export class PricefeederService {
    private readonly logger = new Logger(PricefeederService.name);

    private readonly priceFeedAddress: string = FEERDER_ADDRESS
    private readonly UPDATE_PRICE_FEED = process.env.UPDATE_PRICE_FEED
    private readonly CLEAR_PRICE_DATA = process.env.CLEAR_PRICE_DATA

    private lastFetchTime: number = 0;
    private cachedChangeRates: any[] | null = null;
    private readonly cacheDuration = 5000;

    private readonly priceIds: any[] = [
        { name: "APT", address: AptFeeder, priceDecimal: 8 },
        { name: "USDT", address: UsdtFeeder, priceDecimal: 8 },
        { name: "USDC", address: UsdcFeeder, priceDecimal: 8 },
        { name: "BTC", address: BtcFeeder, priceDecimal: 8 },
        { name: "ETH", address: EthFeeder, priceDecimal: 8 },
        { name: "BNB", address: BnbFeeder, priceDecimal: 8 },
        { name: "SOL", address: SolFeeder, priceDecimal: 8 },
        { name: "AVAX", address: AvaxFeeder, priceDecimal: 8 },
        { name: "PEPE", address: PepeFeeder, priceDecimal: 10 },
        { name: "DOGE", address: DogeFeeder, priceDecimal: 8 },
        { name: "stAPT", address: StAptFeeder, priceDecimal: 8 },
    ];

    private vasBytes: number[][] = []
    private parsedPrices: any[] = []

    private isFetchPriceInProcess = false
    private isUpdateAptosInProcess = false

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handlePriceFeeder() {
        if (this.isFetchPriceInProcess) return
        this.isFetchPriceInProcess = true
        await this.fetchPythPrices();
        this.isFetchPriceInProcess = false
        this.logger.debug("🚀 ~ Fetch Pyth Price ~ ")
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async updatePriceFeeder() {
        if (this.isFunctionOn(this.UPDATE_PRICE_FEED)) {
            if (this.isUpdateAptosInProcess) return
            this.isUpdateAptosInProcess = true
            await this.feedPriceToAptos()
            this.logger.debug("🚀 ~  Feed Aptos Executed ~ ")
            this.isUpdateAptosInProcess = false
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async clearLastDayData() {
        if (this.isFunctionOn(this.CLEAR_PRICE_DATA)) {
            this.clearPriceData()
        }
    }

    getVasBytes() {
        return this.vasBytes
    }
    getParsedPrices() {
        return this.parsedPrices
    }

    async fetchPythPrices(): Promise<void> {
        try {
            let vaas: any[] = []
            for (const item of this.priceIds) {
                const result = await this.fetchPythPricesData(item)
                if (result) {
                    vaas.push(result)
                }

            }

            const validVaas = vaas.filter(vaa => vaa !== null && vaa !== undefined);

            this.vasBytes = validVaas.map(vaa => Array.from(Buffer.from(vaa.binary, 'hex')));
            this.parsedPrices = validVaas.map(item => {
                return {
                    name: item.name,
                    symbol: item.symbol,
                    parsed: item?.parsed,
                    priceDecimal: item?.priceDecimal
                };
            });
        } catch (error) {
            this.logger.warn(`Error Fetching Pyth Price Failed`);
        }
    }

    async fetchPythPricesData(item: any): Promise<any> {
        try {
            const response = await axios.get(`https://hermes-beta.pyth.network/v2/updates/price/latest?ids%5B%5D=${item.address}`);
            if (response) {
                if (this.isFunctionOn(this.UPDATE_PRICE_FEED)) {
                    await this.prisma.priceFeederRecord.create({
                        data: {
                            name: item.name,
                            symbol: item.name,
                            address: item.address,
                            price: response.data.parsed[0].price.price,
                            publish_time: response.data.parsed[0].price.publish_time.toString(),
                            expo: response.data.parsed[0].price.expo,
                            decimal: Math.abs(response.data.parsed[0].price.expo)
                        }
                    })
                }
            }
            return {
                name: item.name, symbol: item.name, binary: response.data.binary.data[0], parsed: response.data.parsed[0].price.price, priceDecimal: item.priceDecimal
            }
        } catch (error) {
            this.logger.error(`Error fetching VAA for priceId ${item.address}:`, error.toString());
            return null
        }
    }

    async feedPriceToAptos() {
        if (!this.vasBytes || this.vasBytes.length === 0) return

        try {
            const transaction = await aptos.transaction.build.simple({
                sender: priceFeederSyncerSigner.accountAddress,
                data: {
                    function: `${this.priceFeedAddress}::pyth::update_price_feeds_with_funder`,
                    typeArguments: [],
                    functionArguments: [this.vasBytes],
                },
            });

            const signdTransaction = await aptos.signAndSubmitTransaction({
                signer: priceFeederSyncerSigner,
                transaction,
            });

            const response = await aptos.waitForTransaction({
                transactionHash: signdTransaction.hash
            })
            this.logger.verbose('Transaction submitted update price feed status', response.success.toString());
        } catch (error) {
            this.logger.error('Transaction submitted Failed', error);
        }

    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }

    async clearPriceData() {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - 24);

        console.log("🚀 ~ PricefeederService ~ clearPriceData ~ cutoffDate:", cutoffDate)

        await this.prisma.priceFeederRecord.deleteMany({
            where: {
                createAt: {
                    lt: cutoffDate,
                },
            },
        });
    }

    async fetchAllSymbol24HoursChange() {
        const currentTime = Date.now();

        if (this.cachedChangeRates && (currentTime - this.lastFetchTime) < this.cacheDuration) {
            this.logger.debug("return cache")
            return this.cachedChangeRates;
        }

        const symbols = SymbolList.map((item) => {
            return item.tokenSymbol;
        });
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const latestRecords = await this.prisma.priceFeederRecord.findMany({
            where: { symbol: { in: symbols } },
            orderBy: { createAt: 'desc' },
            distinct: ['symbol'],
        });

        if (latestRecords.length === 0) {
            throw new Error('No price records found for the given symbols.');
        }

        const pastRecords = await this.prisma.priceFeederRecord.findMany({
            where: {
                symbol: { in: symbols },
                createAt: { lte: twentyFourHoursAgo },
            },
            orderBy: { createAt: 'desc' },
            distinct: ['symbol'],
        });

        let changeRates: any[] = [];

        for (const latestRecord of latestRecords) {
            const pastRecord = pastRecords.find(record => record.symbol === latestRecord.symbol);

            if (!pastRecord) {
                const firstRecord = await this.prisma.priceFeederRecord.findFirst({
                    where: { symbol: latestRecord.symbol },
                    orderBy: { createAt: 'asc' },
                });

                if (!firstRecord) {
                    throw new Error(`No past price records found for symbol ${latestRecord.symbol}.`);
                }

                changeRates.push({
                    symbol: latestRecord.symbol,
                    changeRate: this.calculateChangeRate(firstRecord, latestRecord),
                });
            } else {
                changeRates.push({
                    symbol: latestRecord.symbol,
                    changeRate: this.calculateChangeRate(pastRecord, latestRecord),
                });
            }
        }

        this.cachedChangeRates = changeRates;
        this.lastFetchTime = currentTime;

        return changeRates;
    }

    private calculateChangeRate(pastRecord: PriceFeederRecord, latestRecord: PriceFeederRecord): number {
        const pastPrice = parseFloat(pastRecord.price);
        const latestPrice = parseFloat(latestRecord.price);
        return ((latestPrice - pastPrice) / pastPrice) * 100;
    }

    async getHourlyPriceRecords() {
        const records = await this.prisma.$queryRaw`
          WITH RECURSIVE hours AS (
            SELECT DATE_FORMAT(MIN(createAt), '%Y-%m-%d %H:00:00') AS hour
            FROM LPSimulatePriceRecords
            UNION
            SELECT DATE_ADD(hour, INTERVAL 1 HOUR)
            FROM hours
            WHERE hour < (SELECT MAX(DATE_FORMAT(createAt, '%Y-%m-%d %H:00:00')) FROM LPSimulatePriceRecords)
          )
          SELECT 
            UNIX_TIMESTAMP(h.hour) as time, 
            COALESCE(
              (SELECT lpOutPrice FROM LPSimulatePriceRecords WHERE DATE_FORMAT(createAt, '%Y-%m-%d %H:00:00') = h.hour LIMIT 1), 
              (SELECT lpOutPrice FROM LPSimulatePriceRecords WHERE createAt > h.hour ORDER BY createAt ASC LIMIT 1)
            ) as value 
          FROM hours h
          ORDER BY h.hour ASC;
        `;
        return records;
    }

    async getPriceRecordsByInterval(interval: '30m' | '1h' | '4h' | '1d' | '3d') {
        let timeCondition: string;

        switch (interval) {
            case '30m':
                timeCondition = "MINUTE(createAt) IN (0, 30)";
                break;
            case '1h':
                timeCondition = "MINUTE(createAt) = 0";
                break;
            case '4h':
                timeCondition = "HOUR(createAt) IN (0, 4, 8, 12, 16, 20) AND MINUTE(createAt) = 0";
                break;
            case '1d':
                timeCondition = "HOUR(createAt) = 0 AND MINUTE(createAt) = 0";
                break;
            case '3d':
                timeCondition = "HOUR(createAt) = 0 AND MINUTE(createAt) = 0 AND DAYOFYEAR(createAt) MOD 3 = 0";
                break;
            default:
                throw new Error('Unsupported interval');
        }

        const rawQuery = `
          SELECT 
            UNIX_TIMESTAMP(createAt) as time, 
            lpOutPrice
          FROM LPSimulatePriceRecords
          WHERE ${timeCondition}
          ORDER BY createAt ASC;
        `;

        const records: any[] = await this.prisma.$queryRawUnsafe(rawQuery);

        if (!records || records.length === 0) return [];

        return records.map(record => ({
            time: Number(record.time),
            value: parseFloat(record.lpOutPrice)
        }));
    }
}