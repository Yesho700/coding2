import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { Leave, LeaveSchema } from '../../models/leave.model';
import { User, UserSchema } from '../../models/user.model';
import { TokenModule } from '../token/token.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule,
    TokenModule,
    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService]
})
export class LeaveModule {}