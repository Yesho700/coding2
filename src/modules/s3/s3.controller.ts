import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { S3Service } from './s3.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('S3 Operations')

@UseGuards(AuthGuard)
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  private generateKey(file: Express.Multer.File): string {
    return `uploads/${new Date().toISOString().slice(0, 7)}/${uuidv4()}${path.extname(file.originalname)}`;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file directly to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const key = this.generateKey(file);
    return await this.s3Service.uploadFile(req.userId, file, key);
  }

  @Delete('delete/:key')
  @ApiOperation({ summary: 'Delete file from S3' })
  @ApiParam({ name: 'key', description: 'S3 object key to delete' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Request() req, @Param('key') key: string) {
    return await this.s3Service.deleteFile(req.userId, key); // Fixed: was calling itself recursively
  }

  @Post('presigned-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Generate pre-signed URL for client-side upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File metadata for URL generation',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pre-signed URL generated',
    schema: {
      type: 'object',
      properties: {
        message: {type: 'string'},
        url: { type: 'string' },
        key: { type: 'string' },
      },
    },
  })
  async getSignedUploadUrl(@Request() req, @UploadedFile() file: Express.Multer.File) {
      const key = this.generateKey(file);

      return await this.s3Service.getSignedUploadUrl(req.userId, key, 300, file.mimetype)
    };

  @Get('presigned-delete/:key')
  @ApiOperation({ summary: 'Generate pre-signed URL for client-side deletion' })
  @ApiParam({ name: 'key', description: 'S3 object key to delete' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pre-signed delete URL generated',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string'},
        url: { type: 'string' },
        key: { type:'string'}
      },
    },
  })
  async getSignedDeleteUrl(@Request() req, @Param('key') key: string) {
    return await this.s3Service.getSignedDeleteUrl(req.userId, key, 300)
  }
}
