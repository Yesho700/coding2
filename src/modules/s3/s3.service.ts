
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/models/user.model';
import { Model } from 'mongoose';


@Injectable()
export class S3Service {

    private readonly s3Client : S3Client;
    private readonly bucketName;

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {
        this.bucketName = this.configService.get<string>('aws.bucketName');
        this.s3Client = new S3Client({
            region: this.configService.get<string>('aws.region'),
            credentials: {
                accessKeyId: this.configService.get<string>('aws.accessKeyId'),
                secretAccessKey: this.configService.get<string>('aws.secretAccessKey')
            }
        } as S3ClientConfig);
    }


    async updateProfile(userId: string, key: string): Promise<any> {
        return this.userModel.findByIdAndUpdate(
            userId, 
            { $set: { profile: key } },
            { new: true } 
        ).exec();
    }

    async uploadFile(userId: string, file: Express.Multer.File, key: string): Promise<any>{
        console.log(key);
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await this.s3Client.send(command);
        await this.updateProfile(userId, key);
        return {
            url:`https://${this.bucketName}.s3.amazonaws.com/${key}`,
            message: "File Uploaded Successfully!!",
            key
        }
    }

    async deleteFile(userId: string,key: string): Promise<any> {
        
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        await this.s3Client.send(command);
        await this.updateProfile(userId, "");
        return {message: "File Deleted Successfully!!"}
    }

    async getSignedUploadUrl(userId: string, key: string, expiresIn: number, content: string): Promise<any>{

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: content
        })

        const url = await getSignedUrl(this.s3Client, command, {expiresIn});
        await this.updateProfile(userId, key);
        return { message: "URL Generated Successfully", url, key}
    }

    async getSignedDeleteUrl(userId: string, key: string, expiresIn: number): Promise<any> {
        
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        })

        const url = await getSignedUrl(this.s3Client, command, {expiresIn});
        await this.updateProfile(userId, "");
        return { message: "URL Generated Successfully", url, key}
    }

    async getFileBuffer(userId: string, key: string): Promise<Buffer> {
        
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })

        const response = await this.s3Client.send(command);
        const Bytes = await response.Body?.transformToByteArray();
        if(Bytes)
            return Buffer.from(Bytes);
        return Buffer.from('')
    }
}
