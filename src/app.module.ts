import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './components/auth/auth.module';
import { MediaUploadModule } from './components/file-management/media-upload/media-upload.module';
import { CoinsModule } from './components/coins/coins.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ScheduleModule.forRoot(),
    AuthModule.forRoot(),
    CoinsModule,
    MediaUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
