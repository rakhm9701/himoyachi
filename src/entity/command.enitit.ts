import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CommandType, CommandStatus } from '../libs/enum/command.enum';

export type CommandDocument = Command & Document;

@Schema({ collection: 'commands', timestamps: true })
export class Command {
  @Prop({ type: Types.ObjectId, ref: 'Device', required: true, index: true })
  deviceId: Types.ObjectId;

  @Prop({ enum: CommandType, required: true })
  type: CommandType;

  @Prop({ enum: CommandStatus, default: CommandStatus.PENDING })
  status: CommandStatus;

  @Prop()
  executedAt?: Date;
}

export const CommandSchema = SchemaFactory.createForClass(Command);