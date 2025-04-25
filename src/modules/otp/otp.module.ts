import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { RedisModule } from '../redis/redis.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports:[
    RedisModule,
    TokenModule
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService]
})
export class OtpModule {}
