import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from 'src/entity/alert.entity';
import { Device, DeviceSchema } from 'src/entity/device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule {}
