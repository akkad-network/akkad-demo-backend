import * as dotenv from 'dotenv'
dotenv.config()
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AptFeeder, aptos, AvaxFeeder, BnbFeeder, BtcFeeder, DogeFeeder, EthFeeder, executerSigner, FEERDER_ADDRESS, MODULE_ADDRESS, PepeFeeder, priceFeederSyncerSigner, SolFeeder, UsdcFeeder, UsdtFeeder } from 'src/main';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScannerService } from 'src/scanner/scanner.service';

@Injectable()
export class PricefeederService {
    private readonly logger = new Logger(PricefeederService.name);

    private readonly priceFeedAddress: string = FEERDER_ADDRESS
    private readonly UPDATE_PRICE_FEED = process.env.UPDATE_PRICE_FEED
    private readonly CLEAR_PRICE_DATA = process.env.CLEAR_PRICE_DATA

    private readonly priceIds: any[] = [
        { name: "APT", address: AptFeeder },
        { name: "USDT", address: UsdtFeeder },
        { name: "USDC", address: UsdcFeeder },
        { name: "BTC", address: BtcFeeder },
        { name: "ETH", address: EthFeeder },
        { name: "BNB", address: BnbFeeder },
        { name: "SOL", address: SolFeeder },
        { name: "AVAX", address: AvaxFeeder },
        { name: "PEPE", address: PepeFeeder },
        { name: "DOGE", address: DogeFeeder },
    ];

    private vasBytes: number[][] = []
    private parsedPrices: any[] = []

    private isFetchPriceInProcess = false
    private isUpdateAptosInProcess = false

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
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
            this.vasBytes = vaas?.map(vaa => Array.from(Buffer.from(vaa?.binary, 'hex')));
            this.parsedPrices = vaas?.map(item => { return { name: item.name, symbol: item.symbol, parsed: item?.parsed } });

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
            return { name: item.name, symbol: item.name, binary: response.data.binary.data[0], parsed: response.data.parsed[0].price.price }
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

}