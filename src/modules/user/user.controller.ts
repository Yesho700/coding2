import { Body, Controller, Post, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from 'src/dtos/login.dto';
import { SignUpDto } from 'src/dtos/signup.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ForgetPasswordDto } from 'src/dtos/forgetPassword.dto';
import { UpdatePasswordDto } from 'src/dtos/updatePassword.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { ResetPasswordGuard } from 'src/guards/reset-password.guard';

@ApiTags('User')
@Controller('user/api')
export class UserController {
  
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpData: SignUpDto) {
    return this.userService.signUp(signUpData);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: LoginDto })
  async login(@Body() credentials: LoginDto) {
    return this.userService.login(credentials);
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent to email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: ForgetPasswordDto })
  async forgetPassword(@Body() forgetPasswordData: ForgetPasswordDto) {
    return this.userService.forgetPassword(forgetPasswordData.email);
  }

  @UseGuards(AuthGuard)
  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  async sendOtp(@Request() request) {
    if (!request.userEmail) {
      throw new UnauthorizedException("Enter correct email");
    }
    return this.userService.sendOtp(request.userEmail);
  }

  @UseGuards(AuthGuard)
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or Invalid OTP' })
  @ApiBearerAuth('JWT')
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string', example: '123456' }
      },
      required: ['otp']
    }
  })
  async verifyOtp(@Request() request, @Body('otp') otp: string) {
    if (!request.userEmail) {
      throw new UnauthorizedException("Enter correct email");
    }
    return this.userService.verifyOtp(request.userEmail, otp);
  }

  @UseGuards(ResetPasswordGuard)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  @ApiBody({ type: UpdatePasswordDto })
  async resetPassword(@Request() request, @Body() updatePasswordData: UpdatePasswordDto) {
    return this.userService.resetPassword(request.userEmail, updatePasswordData.newPassword);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  async getProfile(@Request() request) {
    return this.userService.getProfile(request.userId);
  }
}