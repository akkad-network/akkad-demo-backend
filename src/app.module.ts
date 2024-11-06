import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { ListenerModule } from './listener/listener.module';
import { ListenerController } from './listener/listener.controller';
import { ListenerService } from './listener/listener.service';
import { EnforcerController } from './executor/executor.controller';
import { EnforcerService } from './executor/executor.service';
import { EnforcerModule } from './executor/executor.module';
import { SentinelController } from './synchronizer/synchronizer.controller';
import { SentinelService } from './synchronizer/synchronizer.service';
import { SentinelModule } from './synchronizer/synchronizer.module';

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
