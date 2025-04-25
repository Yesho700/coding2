import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.model';

export type LeaveDocument = Leave & Document;

export enum LeaveType {
  PLANNED = 'PLANNED',
  EMERGENCY = 'EMERGENCY',
}

export enum Status {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Schema({ timestamps: true })
export class Leave {
  @Prop({ type: String, enum: LeaveType, required: true })
  type: LeaveType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: String, enum: Status, default: Status.PENDING})
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({default: Date.now})
  date: Date
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);