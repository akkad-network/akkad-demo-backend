import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

dotenv.config()
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const privateKey = process.env.PRIVATE_KEY
export const aptos = new Aptos(aptosConfig);
export const singer = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(privateKey) })

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3002);
}
bootstrap();
