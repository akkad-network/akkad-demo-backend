import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralRecords, UserReferralCode } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { aptos, MODULE_ADDRESS, priceFeederSyncerSigner } from 'src/main';
import { APTOS_COIN } from '@aptos-labs/ts-sdk';

@Injectable()
export class ReferralService {
    constructor(private prisma: PrismaService) { }

    async generateReferralCode(): Promise<string> {
        let referralCode: string;
        let exists: UserReferralCode | null;

        do {
            referralCode = uuidv4().replace(/-/g, '').substring(0, 20);
            exists = await this.prisma.userReferralCode.findFirst({
                where: { referral_code: referralCode.toString() },
            });
        } while (exists);

        return referralCode;
    }

    async getUserReferralCode(wallet_address: string): Promise<UserReferralCode> {
        if (!wallet_address) return null
        let userReferralCode = await this.prisma.userReferralCode.findFirst({
            where: { wallet_address },
        });

        if (!userReferralCode) {
            const referralCode = await this.generateReferralCode();
            userReferralCode = await this.prisma.userReferralCode.create({
                data: {
                    wallet_address,
                    referral_code: referralCode,
                },
            });
        }

        return userReferralCode;
    }


    async findReferrerByInviteCode(invite_code: string): Promise<UserReferralCode | null> {
        return this.prisma.userReferralCode.findFirst({
            where: { referral_code: invite_code },
        });
    }

    async findRefferals(wallet_address: string): Promise<any> {
        return this.prisma.referralRecords.findMany({
            where: {
                referrer_address: wallet_address
            }
        })
    }

    async bindReferrer(invite_code: string, wallet_address: string): Promise<any> {
        const referrer = await this.prisma.userReferralCode.findFirst({
            where: { referral_code: invite_code },
        });
        if (referrer) {

            const referrer_address = referrer.wallet_address
            const referrer_code = referrer.referral_code
            const existingRecord = await this.prisma.referralRecords.findFirst({
                where: {
                    referrer_address,
                    referral_user_address: wallet_address
                },
            });
            if (existingRecord) {
                return true;
            }

            await this.prisma.referralRecords.create({
                data: {
                    referrer_address,
                    referrer_code,
                    referral_user_address: wallet_address
                }
            })

            const transaction = await aptos.transaction.build.simple({
                sender: priceFeederSyncerSigner.accountAddress,
                data: {
                    function: `${MODULE_ADDRESS}::market::add_new_referral`,
                    typeArguments: [APTOS_COIN],
                    functionArguments: [referrer_address],
                },
            });

            const committedTransaction = await aptos.signAndSubmitTransaction({
                signer: priceFeederSyncerSigner,
                transaction,
            });
            console.log("🚀 ~ ReferralService ~ bindReferrer ~ committedTransaction:", committedTransaction)
            return true
        } else {
            return false
        }
    }
}