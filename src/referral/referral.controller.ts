import { Controller, Get, Query } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) { }

    @Get('getOrCreateReferralCode')
    async getOrCreateReferralCode(@Query('wallet_address') wallet_address: string) {
        const userReferralCode = await this.referralService.getUserReferralCode(wallet_address);
        return userReferralCode;
    }

    @Get('findReferrer')
    async findReferrer(@Query('invite_code') invite_code: string) {
        const referralRecord = await this.referralService.findReferrerByInviteCode(invite_code);
        return referralRecord;
    }

    @Get('bindReferrer')
    async bindReferrer(@Query('invite_code') invite_code: string, @Query('wallet_address') wallet_address: string) {
        const result = await this.referralService.bindReferrer(invite_code, wallet_address);
        return result;
    }

    @Get('findMyRefferals')
    async findMyRefferals(@Query('wallet_address') wallet_address: string) {
        const result = await this.referralService.findRefferals(wallet_address)
        return result
    }

}
