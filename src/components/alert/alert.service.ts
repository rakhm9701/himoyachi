import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument } from 'src/entity/alert.entity';
import { Device, DeviceDocument } from 'src/entity/device.entity';
import { CreateAlertDto } from 'src/libs/dto/alert.dto';
import { ErrorMessages } from 'src/libs/error/error.messages';
import { ValidationHelper } from 'src/libs/error/validation.helper';

@Injectable()
export class AlertService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  // create alert
  async create(input: CreateAlertDto): Promise<Alert> {
    const device = await this.deviceModel.findOne({
      deviceKey: input.deviceKey,
    });
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    const newAlert = new this.alertModel({
      deviceId: device._id,
      username: input.username,
      ipAddressz: input.ipAddress,
      triggeredAt: new Date(),
    });
    await this.deviceModel.findByIdAndUpdate(device._id, {
      lastSeen: new Date(),
    });
    const result = await newAlert.save();
    console.log('Result:', result);
    return result;
  }

  // get alerts by deviceId
  async findByDeviceId(
    deviceId: string,
  ): Promise<{ alerts: Alert[]; count: number }> {
    ValidationHelper.validateObjectId(deviceId);

    const alerts = await this.alertModel
      .find({ deviceId: new Types.ObjectId(deviceId) })
      .sort({ triggeredAt: -1 });

    return { alerts, count: alerts.length };
  }

  async findByMemberId(
    memberId: string,
  ): Promise<{ alerts: Alert[]; count: number }> {
    ValidationHelper.validateObjectId(memberId);
    const devices = await this.deviceModel.find({ memberId });
    const deviceIds = devices.map((d) => d._id);
    const alerts = await this.alertModel
      .find({ deviceId: { $in: deviceIds } })
      .sort({ triggeredAt: -1 });
    console.log('result:', alerts);
    return { alerts, count: alerts.length };
  }
}
