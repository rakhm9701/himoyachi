import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AlertType } from '../libs/enum/alert.enum';

export type AlertDocument = Alert & Document;

@Schema({ collection: 'alerts', timestamps: true })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'Device', required: true, index: true })
  deviceId: Types.ObjectId;

  @Prop()
  username: string;

  @Prop()
  ipAddress: string;

  @Prop({ enum: AlertType, default: AlertType.POWER_ON })
  type: AlertType;

  @Prop({ required: true })
  triggeredAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);