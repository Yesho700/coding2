import { RedisService } from '../redis/redis.service';
import { TokenService } from './../token/token.service';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {

    constructor(
        private readonly tokenService: TokenService,
        private readonly redisService: RedisService
    ){}

    async verify(email: string, otp: string){

        const otpDoc = await this.redisService.getData(`otp-${email}`)

        if(!otpDoc)   
            throw new ForbiddenException("OTP Expired!!");

        const isValid = await this.tokenService.compare(otp, otpDoc.toString());

        if(isValid){
            await this.redisService.deleteData(`otp-${email}`);
            return true;
        }
        return false;
    }


    async generateOtp(email: string){
        const otp = Math.floor(99999 + Math.random() * 100000)
        const otpStr = otp.toString();
        const hashOtp = await this.tokenService.hash(otpStr);
        await this.redisService.setData(`otp-${email}`, hashOtp, 5 * 60 * 1000)
        return otpStr;
      }
}
