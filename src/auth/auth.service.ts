import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Twitter from 'twitter';
import * as dotenv from 'dotenv'
import * as crypto from 'crypto';

dotenv.config()

@Injectable()
export class AuthService {
    private twitterClient: Twitter;
    constructor(private prisma: PrismaService) {
        this.twitterClient = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            // access_token_key: process.env.TWITTER_ACCESS_TOKEN,
            // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
            bearer_token: process.env.TWITTER_BEARER_TOKEN,
        });
    }

    async verifyFollow(userToken: string, userTokenSecret: string, userName: string, targetAccount: string): Promise<boolean> {
        // this.twitterClient.options.access_token_key = userToken;
        // this.twitterClient.options.access_token_secret = userTokenSecret;
        try {
            const response = await this.twitterClient.get('friendships/show', {
                source_screen_name: userName,
                target_screen_name: targetAccount
            });

            return response.relationship.source.following;
        } catch (error) {
            console.error('Error verifying follow:', error);
            return false;
        }
    }

    async verifyRetweet(userToken: string, userTokenSecret: string, tweetId: string): Promise<boolean> {
        // this.twitterClient.options.access_token_key = userToken;
        // this.twitterClient.options.access_token_secret = userTokenSecret;

        try {
            const response = await this.twitterClient.get('statuses/retweets_of_me', { count: 100 });

            const hasRetweeted = response.some((tweet: any) => tweet.id_str === tweetId);
            return hasRetweeted;
        } catch (error) {
            console.error('Error verifying retweet:', error);
            return false;
        }
    }

    async login(userId: string) {

    }

}