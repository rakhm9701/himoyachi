import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ScreenshotService } from './screenshot.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('screenshot')
export class ScreenshotController {
  constructor(private readonly screenshotService: ScreenshotService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/screenshots',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('deviceKey') deviceKey: string,
    @Body('commandId') commandId: string,
  ) {
    console.log('Post: uploadScreenshot');
    return this.screenshotService.upload(deviceKey, commandId, file);
  }
}