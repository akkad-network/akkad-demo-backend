import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv'
import * as TelegramBot from 'node-telegram-bot-api';

dotenv.config()
@Injectable()
export class TelegramService implements OnModuleInit {
    private readonly TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    private readonly TELEGRAM_BOT = process.env.TELEGRAM_BOT

    private bot: TelegramBot;
    constructor() { }
    onModuleInit() {
        if (this.isFunctionOn(this.TELEGRAM_BOT)) {
            this.bot = new TelegramBot(this.TELEGRAM_TOKEN, { polling: true });
            this.initializeBotHandlers();
        }
    }

    public getBot() {
        return this.bot;
    }

    private initializeBotHandlers() {
        console.log("🚀 ~ TelegramService ~ initializeBotHandlers ~ initializeBotHandlers:")
        this.bot.onText(/\/start(?: (.+))?/, (msg: any, match: any) => {
            // if (match && match[1]) {
            // this.handleStartCommandWithParmas(msg, match);
            // } else {
            this.handleStartCommand(msg);
            // }
        });
    }
    // private initializeBotHandlers() {
    //     this.bot.onText(/\/start/, (msg: any) => this.handleStartCommand(msg));
    //     this.bot.onText(/\/start (.+)/, (msg: any, match: any) => this.handleStartCommandWithParmas(msg, match));
    //     this.bot.on('new_chat_members', (msg: any) => this.handleNewMember(msg));
    // }
    private async handleStartCommand(msg: TelegramBot.Message) {
        console.log("🚀 ~ TelegramService ~ handleStartCommand ~ msg:", msg)
        const chatID = msg.chat.id;
        await this.sendPhotoLink(chatID, msg.from?.username || msg.chat?.username);
    }

    private async handleStartCommandWithParmas(msg: TelegramBot.Message, params: string[]) {
        const userId = msg.from?.id;
        const inviteCode = params[1];
        const chatID = msg.chat.id

        await this.sendPhotoLink(chatID, msg.from?.username || msg.chat?.username);
    }

    // <a href="https://t.me/blazehub_bot/app">Join us one project at a timel</a>\n\n$BLAZE | <a href="https://t.me/blazehub_bot/app">Blaze Hub</a> | <a href="http://t.me/BlazeHubCommunity">Chat</a> | <a href="https://x.com/blzhub">X</a> | <a href="https://www.blazenets.com">Website</a>
    async sendPhotoLink(userId, username) {
        try {
            await this.bot.sendPhoto(userId, 'https://imgur.com/a/6fXvL1t', {
                caption: `Welcome to AGDEX , ${username} \n\nNext-gen Decentralized Perpetual Exchange | Up to 100x leverage directly from your wallet`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Start AGDEX', url: 'https://t.me/agdex_bot/app' },

                    ]]
                },
                parse_mode: 'HTML'
            });
        } catch (error) {
            console.error('Error sending link to user:', error);
        }
    }


    async getUserProfilePhotos(userId: string): Promise<boolean> {
        try {
            const response = await axios.get(`https://api.telegram.org/bot${this.TELEGRAM_TOKEN}/getUserProfilePhotos`, {
                params: {
                    user_id: userId,
                },
            });

            const data = response.data;
            console.log("🚀 ~ TelegramService ~ getUserProfilePhotos ~ data:", data.result.photos)
            return data.ok && data.result.total_count >= 0;
        } catch (error) {
            console.error('Error verifying user ID:', error);
            return false;
        }
    }

    private readonly logger = new Logger(TelegramService.name);
    private unFinishDailyTaskUserIds = [];
    private isSending = false;

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }

}