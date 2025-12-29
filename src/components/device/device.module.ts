import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { Device, DeviceSchema } from 'src/entity/device.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from 'src/entity/member.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  providers: [DeviceService],
  controllers: [DeviceController],
  exports: [DeviceService],
})
export class DeviceModule {}
