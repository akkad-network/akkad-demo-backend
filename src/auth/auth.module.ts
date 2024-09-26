import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TwitterStrategy } from '../twitter/twitter.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [PassportModule.register({ session: true })],
    providers: [TwitterStrategy, AuthService],
    controllers: [AuthController],
})
export class AuthModule { }

