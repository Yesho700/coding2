import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { LeaveType } from '../models/leave.model'

export class ApplyLeaveDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsEnum(LeaveType)
  type: LeaveType;
}