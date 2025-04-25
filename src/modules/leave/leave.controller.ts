import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UsePipes,
  UseGuards,
  Request
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { ApplyLeaveDto } from '../../dtos/apply-leave.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { QueryTransformPipe } from '../../pipes/query-transform.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { Role } from 'src/models/user.model';
import { Roles } from 'src/decorators/role.decorator';

@ApiTags('Leave Management')
@ApiBearerAuth('JWT')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Apply for leave' })
  @ApiResponse({ 
    status: 201, 
    description: 'Leave application submitted successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid leave application data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiBody({ 
    type: ApplyLeaveDto,
    description: 'Leave application details' 
  })
  async applyForLeave(
    @Request() request, 
    @Body() applyLeaveData: ApplyLeaveDto
  ) {
    return this.leaveService.applyForLeave(request.userId, applyLeaveData);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  @UsePipes(new QueryTransformPipe())
  @ApiOperation({ summary: 'Get leaves for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user leaves retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page'
  })
  async getUserLeaves(
    @Request() request, 
    @Query() paginationDto: PaginationDto
  ) {
    return this.leaveService.getUserLeaves(request.userId, paginationDto);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get()
  @UsePipes(new QueryTransformPipe())
  @ApiOperation({ summary: 'Get all leaves (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all leaves retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden (Admin access only)' 
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page'
  })
  async getAllLeaves(@Query() paginationDto: PaginationDto) {
    return this.leaveService.getAllLeaves(paginationDto);
  }
}