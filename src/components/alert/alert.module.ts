import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { Alert, AlertSchema } from '../../entity/alert.entity';
import { Device, DeviceSchema } from '../../entity/device.entity';
import { Member, MemberSchema } from '../../entity/member.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}