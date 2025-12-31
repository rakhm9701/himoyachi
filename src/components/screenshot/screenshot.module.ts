import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Screenshot, ScreenshotSchema } from '../../entity/screenshot.entity';
import { Device, DeviceSchema } from '../../entity/device.entity';
import { Member, MemberSchema } from '../../entity/member.entity';
import { Command, CommandSchema } from 'src/entity/command.enitit';
import { ScreenshotService } from './screenshot.service';
import { ScreenshotController } from './screenshot.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Screenshot.name, schema: ScreenshotSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Command.name, schema: CommandSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [ScreenshotController],
  providers: [ScreenshotService],
  exports: [ScreenshotService],
})
export class ScreenshotModule {}