import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeviceOS, DeviceStatus } from '../libs/enum/device.enum';

export type DeviceDocument = Device & Document;

@Schema({ collection: 'devices', timestamps: true })
export class Device {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  deviceKey: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: DeviceOS, default: DeviceOS.MAC })
  osType: DeviceOS;

  @Prop({ enum: DeviceStatus, default: DeviceStatus.ACTIVE, index: true })
  status: DeviceStatus;

  @Prop()
  lastSeen?: Date;

  @Prop()
  deletedAt?: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);