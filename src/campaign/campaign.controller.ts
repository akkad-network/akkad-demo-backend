import { Controller, Post, Get, Body, Param, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('campaign')
export class CampaignController {
    private readonly logger = new Logger(CampaignController.name)

    constructor(private readonly campaignService: CampaignService) { }

    // Endpoint for Twitter follow action
    @Post('twitter-follow')
    async twitterFollow(@Body('address') address: string) {
        const result = await this.campaignService.twitterFollow(address);
        return result
    }

    // Endpoint for Discord join action
    @Post('discord-join')
    async discordJoin(@Body('address') address: string) {
        const result = await this.campaignService.discordJoin(address);
        return result
    }

    // Endpoint to fetch social records by address
    @Get(':address')
    async getSocialRecords(@Param('address') address: string) {
        const result = await this.campaignService.getSocialRecords(address);
        return result
    }

    @Post('registerCampaign')
    async registerCampaign(@Body('address') address: string) {
        const result = await this.campaignService.registerCampaign(address);
        return result
    }

    @Post('getCampaignUserInfo')
    async campaignInfo(@Body('address') address: string) {
        const result = await this.campaignService.getCampaignInfo(address);
        return result;
    }

    @Post('campaignRank')
    async campaignRank() {
        const result = await this.campaignService.campaignRank();
        return result
    }
}
