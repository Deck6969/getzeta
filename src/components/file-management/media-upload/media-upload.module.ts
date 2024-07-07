import { Module } from '@nestjs/common';
import { MediaUploadController } from './media-upload.controller';
import { MediaUploadService } from './media-upload.service';

@Module({
  controllers: [MediaUploadController],
  providers: [MediaUploadService],
})
export class MediaUploadModule {}
