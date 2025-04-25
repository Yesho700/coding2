import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './config/configuration';
import { UserModule } from './modules/user/user.module';
import { LeaveModule } from './modules/leave/leave.module';
import { S3Module } from './modules/s3/s3.module';



@Module({
  imports: [
    
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration]
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('db.uri')
        }
      }
    }),
    
    UserModule,
    LeaveModule,
    S3Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
