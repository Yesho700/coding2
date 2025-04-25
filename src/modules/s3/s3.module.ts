import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { TokenModule } from '../token/token.module';

@Module({
  imports:[
    TokenModule,
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ConfigModule,
    MulterModule.register({
      dest: './uploads'
    })
  ],
  controllers: [S3Controller],
  providers: [S3Service],
})
export class S3Module {}
