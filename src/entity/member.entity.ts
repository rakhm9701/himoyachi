import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  MemberRole,
  MemberStatus,
  MemberLanguage,
} from '../libs/enum/member.enum';

export type MemberDocument = Member & Document;

@Schema({ collection: 'members', timestamps: true })
export class Member {
  @Prop({ required: true, unique: true, index: true })
  telegramId: string;

  @Prop({ index: true })
  username: string;

  @Prop()
  firstName: string;

  @Prop({ enum: MemberRole, default: MemberRole.USER })
  role: MemberRole

  @Prop({ enum: MemberStatus, default: MemberStatus.ACTIVE, index: true })
  status: MemberStatus

  @Prop({ enum: MemberLanguage, default: MemberLanguage.UZ })
  language: MemberLanguage

  // Kelajak uchun (optional)
  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  plan?: string;

  @Prop()
  planExpiresAt?: Date;

  @Prop()
  referralCode?: string;

  @Prop()
  referredBy?: string;

  @Prop({ default: 1 })
  maxDevices?: number;

  @Prop({ type: Object })
  settings?: Record<string, any>;

  @Prop()
  deletedAt?: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
