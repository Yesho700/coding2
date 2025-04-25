import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from 'src/dtos/signup.dto';
import { User, UserDocument } from 'src/models/user.model';
import { TokenService } from '../token/token.service';
import { LoginDto } from 'src/dtos/login.dto';
import { EmailService } from '../email/email.service';
import { OtpService } from '../otp/otp.service';
import { Response } from 'express';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly tokenService: TokenService,
        private readonly emailService: EmailService,
        private readonly otpServie: OtpService
    ){}

    async findByEmail(email: string){
        return await this.userModel.findOne({email: email});
    }

    async create(signupData: SignUpDto){
        await this.userModel.create(signupData);
        return {message: "User Created Successfully!!"};
    }

    async signUp(signUpData: SignUpDto){
            
        const { email, password } = signUpData;
        
        const existingUser = await this.findByEmail(email);

        if(existingUser){
            throw new ConflictException("Email in Use!!!");
        }

        const hashPassword = await this.tokenService.hash(password);
        
        return this.create({...signUpData, password: hashPassword})
    }
    
    
    async login(credentials: LoginDto){
        
        const { email, password } = credentials;

        const existingUser = await this.findByEmail(email);

        if(!existingUser){
            throw new NotFoundException("User Not Found");
        }

        const isValid = await this.tokenService.compare(password, existingUser.password);

        if(!isValid){
            throw new UnauthorizedException("Invalid Credentials!!");
        }

        const payload = { userId: existingUser._id, role: existingUser.role}

        const accessToken = await this.tokenService.sign(payload);

        return {
            message: "Login SuccessFull",
            accessToken
        }
    }


    async forgetPassword(email: string){

        const existingUser = await this.findByEmail(email);

        if(!existingUser){
            throw new NotFoundException("User Not Found !!");
        }
        
        const payload = { userEmail: email };
        const accessToken = await this.tokenService.sign(payload);
        return {accessToken}
    }

    async sendOtp(email: string){
        const otp = await this.emailService.sendEmail(email);
        return {message:"Message Send succussfully !!", otp};
    }

    async verifyOtp(email: string, otp: string){

        const isValid = await this.otpServie.verify(email, otp);
        
        if(!isValid){
            throw new UnauthorizedException("Invalid Credentials!!");
        }
        
        const payload = { access: true, userEmail: email }
        const accessToken = await this.tokenService.sign(payload);
        return {message: "OTP Verified", accessToken}
    }

    async resetPassword(email: string, newPassword: string){

        const existingUser = await this.findByEmail(email);

        if(!existingUser){
            throw new NotFoundException("User not Exists!!");
        }

        const hashedPassword = await this.tokenService.hash(newPassword);

        existingUser.password = hashedPassword;
        await existingUser.save();

        return {message: "Password Resets Successfully!!"}
    }

    
    async getProfile(userId: string){
        return await this.userModel.findOne({_id: userId}, {name: 1, email: 1, DOJ: 1, profile: 1})
    }
}
