import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScreenshotDocument = Screenshot & Document;

@Schema({ collection: 'screenshots', timestamps: true })
export class Screenshot {
  @Prop({ type: Types.ObjectId, ref: 'Device', required: true, index: true })
  deviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Command', required: true })
  commandId: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  size?: number;
}

export const ScreenshotSchema = SchemaFactory.createForClass(Screenshot);