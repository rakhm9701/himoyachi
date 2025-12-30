import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../../entity/device.entity';
import { Member, MemberSchema } from '../../entity/member.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  providers: [CronService],
})
export class CronModule {}