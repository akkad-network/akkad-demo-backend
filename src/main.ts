import * as dotenv from 'dotenv'
dotenv.config()
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });

const priceFeederSyncerPK = process.env.PRICE_FEED_AND_SYNCER_PK
const executerPK = process.env.EXECUTER_PK
const liquidator = process.env.LIQUIDATOR_PK

export const aptos = new Aptos(aptosConfig);
export const priceFeederSyncerSigner = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(priceFeederSyncerPK) })
export const executerSigner = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(executerPK) })
export const liquidatorSigner = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(liquidator) })

export const AptFeeder = process.env.APT_FEEDER_ADDRESS
export const UsdtFeeder = process.env.USDT_FEEDER_ADDRESS
export const UsdcFeeder = process.env.USDC_FEEDER_ADDRESS
export const BtcFeeder = process.env.BTC_FEEDER_ADDRESS
export const EthFeeder = process.env.ETH_FEEDER_ADDRESS
export const BnbFeeder = process.env.BNB_FEEDER_ADDRESS
export const SolFeeder = process.env.SOL_FEEDER_ADDRESS
export const AvaxFeeder = process.env.AVAX_FEEDER_ADDRESS
export const PepeFeeder = process.env.PEPE_FEEDER_ADDRESS
export const DogeFeeder = process.env.DOGE_FEEDER_ADDRESS

export const MODULE_ADDRESS = process.env.MODULE_ADDRESS
export const FEERDER_ADDRESS = process.env.PRICE_FEEDER_ADDRESS
export const COIN_ADDRESS = process.env.COIN_ADDRESS

export const PORT = process.env.PORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(PORT);
}
bootstrap();
