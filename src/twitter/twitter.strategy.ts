import * as dotenv from 'dotenv';
dotenv.config();
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@superfaceai/passport-twitter-oauth2';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';


@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {

    constructor() {
        super({
            clientType: 'confidential',
            clientID: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            callbackURL: process.env.TWITTER_LOGIN_CALLBACK_URL,
        });
    }

    authenticate(req: Request, options?: any): void {
        options.scope = ["tweet.read", "users.read", "offline.access", "follows.read", "follows.write"]
        super.authenticate(req, options)
    }

    validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
        const user = {
            twitterId: profile.id,
            screenName: profile.username,
            token: accessToken,
            refreshToken,
        };

        return done(null, user);
    }
}