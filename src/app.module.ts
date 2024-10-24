import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { ListenerModule } from './listener/listener.module';
import { ListenerController } from './listener/listener.controller';
import { ListenerService } from './listener/listener.service';
import { EnforcerController } from './enforcer/enforcer.controller';
import { EnforcerService } from './enforcer/enforcer.service';
import { EnforcerModule } from './enforcer/enforcer.module';
import { SentinelController } from './sentinel/sentinel.controller';
import { SentinelService } from './sentinel/sentinel.service';
import { SentinelModule } from './sentinel/sentinel.module';

@Module({
  controllers: [AppController, ListenerController, EnforcerController, SentinelController],
  providers: [AppService, ListenerService, EnforcerService, SentinelService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ListenerModule,
    EnforcerModule,
    SentinelModule,
  ],
})
export class AppModule { }
