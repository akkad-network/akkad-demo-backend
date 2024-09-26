import { Controller, Get, Req, Res, UseGuards, Post, Body, Query, HttpStatus, HttpException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { link } from 'fs';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('login')
    async login(
        @Req() req: any,
        @Body('userId') userId: string,
        @Body('inviteCode') inviteCode?: string,
    ) {
        const userData: any = this.authService.login(userId);
        if (userData.twitterId && userData.screenName && userData.twitterToken && userData.twitterRefreshToken) {
            req.session.twitterUser = {
                twitterId: userData.twitterId,
                screenName: userData.screenName,
                token: userData.twitterToken,
                refreshToken: userData.refreshToken
            }
        }
        return userData
    }

    @Get('twitter')
    @UseGuards(AuthGuard('twitter'))
    async twitterAuth(@Req() req: any) {
        // Initiates the Twitter OAuth login flow
    }

    @Get('twitter/callback')
    @UseGuards(AuthGuard('twitter'))
    async twitterAuthCallback(@Req() req: any, @Res() res: any) {
        const user = req.user;
        console.log("🚀 ~ AuthController ~ twitterAuthCallback ~ user:", user)
        req.session.twitterUser = user;
        const userEncoded = encodeURIComponent(JSON.stringify(user));
        // const redirectUrl = `tg://my_first_test_botBot/test_tzh_mp?user=${userEncoded}`;
        // res.redirect('tg://')
        const redirectUrl = `tg://`;
        // const redirectUrl = `https://t.me/LumioTestBot/LumioFun?userEncoded=${userEncoded}`;
        // const redirectUrl = `https://t.me/my_first_test_botBot/test_tzh_mp?start=${userEncoded}`;
        // res.redirect(`tg://resolve?domain=my_first_test_botBot&start=auth-${userEncoded}`);
        // res.redirect(`https://t.me/LumioTestBot/LumioFun?userEncoded=${userEncoded}`)
        res.redirect(redirectUrl)
    }

    @Get('verifyFollow')
    async verifyFollow(@Req() req: any) {
        const twitterUser = req.session.twitterUser;
        // const link = 'https://x.com/intent/follow?screen_name=elonmusk'
        // const link = 'https://x.com/lumiofdn';
        // const link = 'https://x.com/pontemnetwork?s=21&t=s6wl3o6BxHja80KRbHOUVw';

        // if (!twitterUser) {
        //     return { flag: false, link, errorCode: '401' }
        // }

        const userToken = twitterUser?.token;
        const userTokenSecret = twitterUser?.refreshToken;
        const userName = twitterUser?.screenName
        const userId = req.query.userId
        const taskId = req.query.taskId
        const link = req.query.link;
        try {
            const isFollowing = await this.authService.verifyFollow(userToken, userTokenSecret, userName, 'Lumio');
            // if (isFollowing) {
            // }
            return { flag: isFollowing, link }
        } catch (error) {
            console.error('Error verifying follow:', error);
        }
    }

    @Get('verifyRetweet')
    async verifyRetweet(@Req() req: any) {
        const twitterUser = req.session.twitterUser;
        // const link = "https://twitter.com/intent/retweet?tweet_id=1808168603721650364"
        // const link = 'https://x.com/lumiofdn/status/1797716768863195602?s=46&t=Leypo_tsggpH_Meh79Aj8Q';
        // const link = 'https://x.com/pontemnetwork?s=21&t=s6wl3o6BxHja80KRbHOUVw';

        // if (!twitterUser) {
        //     return { flag: false, link, errorCode: '401' }
        // }

        const userToken = twitterUser?.token;
        const userTokenSecret = twitterUser?.refreshToken;
        const userId = req.query.userId
        const taskId = req.query.taskId
        const link = req.query.link;
        try {
            const hasRetweeted = await this.authService.verifyRetweet(userToken, userTokenSecret, '1808168603721650364');
            // if (hasRetweeted) {
            // }
            return { flag: hasRetweeted, link }
        } catch (error) {
            console.error('Error verifying retweet:', error);
        }
    }
}