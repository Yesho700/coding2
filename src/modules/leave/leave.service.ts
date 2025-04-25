import {
    Injectable,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Leave, LeaveDocument } from '../../models/leave.model';
  import { User, UserDocument } from '../../models/user.model';
  import { ApplyLeaveDto } from '../../dtos/apply-leave.dto';
  import { PaginationDto } from '../../dtos/pagination.dto';

  
  @Injectable()
  export class LeaveService {
    constructor(
      @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
      @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
  
  
    async applyForLeave(userId: string, applyLeaveData: ApplyLeaveDto){

      const { startDate, endDate, type } = applyLeaveData;
      
      this.validateLeaveDates(new Date(startDate), new Date(endDate));
  
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const leaveDays = this.calculateLeaveDays(startDate, endDate);

      if (user.remainingLeaves < leaveDays) {
        throw new BadRequestException('Not enough remaining leaves');
      }
  
      const hasOverlappingLeave = await this.checkOverlappingLeaves(userId, startDate, endDate);
      if (hasOverlappingLeave) {
        throw new BadRequestException('You already have a leave during this period');
      }
  
      const leave = await this.leaveModel.create({
        type,
        startDate,
        endDate,
        user: userId,
      });
  
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: {
            remainingLeaves: -leaveDays,
          [`${type.toLowerCase()}Leave`]: leaveDays,
        },
      });
  
      return leave
    }
  
    async getUserLeaves(userId: string, paginationDto: PaginationDto) {
        const { page = 1, limit = 10, sort, filter } = paginationDto;
        const skip = (page - 1) * limit;
  
      const query = this.leaveModel.find({ user: userId });
      console.log(query,'llllllllllllllllllllllll')
      if (filter) {
        const filters = filter.split(',');
        filters.forEach((f) => {
          const [key, value] = f.split(':');
          if (key === 'startDate' || key === 'endDate') {
            query.where(key).equals(new Date(value));
          } else {
            query.where(key).equals(value);
          }
        });
      }
  
      if (sort) {
        query.sort(sort);
      }
  
      const [leaves, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        this.leaveModel.countDocuments({ user: userId }).exec(),
      ]);
  
      return {
        data: leaves,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async getAllLeaves(
      paginationDto: PaginationDto,
    ){
        const { page = 1, limit = 10, sort, filter, search } = paginationDto;
        const skip = (page - 1) * limit;
  
      const query = this.leaveModel.find();
      console.log(query);
  
      if (filter) {
        const filters = filter.split(',');
        filters.forEach((f) => {
          const [key, value] = f.split(':');
          if (key === 'startDate' || key === 'endDate') {
            query.where(key).equals(new Date(value));
          } else {
            query.where(key).equals(value);
          }
        });
      }
  
      if (search) {
        query.populate({
          path: 'user',
          match: { name: { $regex: search, $options: 'i' } },
          select: 'name email',
        });
      } else {
        query.populate('user', 'name email');
      }
  
      if (sort) {
        query.sort(sort);
      }
  
      const [leaves, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        this.leaveModel.countDocuments().exec(),
      ]);
  

      return {
        data: leaves,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    private validateLeaveDates(startDate: Date, endDate: Date){

      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (endDate < startDate) {
        throw new BadRequestException('End date cannot be before start date');
      }
  
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      
      if (startDate < threeDaysAgo) {
        throw new BadRequestException('Cannot apply for leaves starting more than 3 days in the past');
      }

    }
  
    private calculateLeaveDays(startDate: Date, endDate: Date){

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      const timeDiff = end.getTime() - start.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    }
  
    private async checkOverlappingLeaves(
      userId: string,
      newStartDate: Date,
      newEndDate: Date,
    ){
      const existingLeaves = await this.leaveModel.find({
        user: userId,
        $or: [
          { startDate: { $gte: newStartDate, $lte: newEndDate } },
          { endDate: { $gte: newStartDate, $lte: newEndDate } },
          { startDate: { $lte: newStartDate }, endDate: { $gte: newEndDate } },
        ],
      });
  
      return existingLeaves.length > 0;
    }
  }