import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument } from 'src/entity/alert.entity';
import { Device, DeviceDocument } from 'src/entity/device.entity';
import { Member, MemberDocument } from 'src/entity/member.entity';
import { CreateAlertDto } from 'src/libs/dto/alert.dto';
import { ErrorMessages } from 'src/libs/error/error.messages';
import { ValidationHelper } from 'src/libs/error/validation.helper';
import { DeviceStatus } from '../../libs/enum/device.enum';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlertService {
  private bot: Telegraf;
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private configService: ConfigService,
  ) {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
    );
  }

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    // Device mavjudligini tekshir
    const device = await this.deviceModel.findOne({
      deviceKey: createAlertDto.deviceKey,
    });
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }

    // Member topish
    const member = await this.memberModel.findById(device.memberId);
    if (!member) {
      throw new NotFoundException(ErrorMessages.MEMBER_NOT_FOUND);
    }

    // Birinchi alert bo'lsa - device ni activate qilish
    const isFirstAlert = device.status === DeviceStatus.PENDING;

    if (isFirstAlert) {
      await this.deviceModel.findByIdAndUpdate(device._id, {
        status: DeviceStatus.ACTIVE,
        lastSeen: new Date(),
      });
    } else {
      await this.deviceModel.findByIdAndUpdate(device._id, {
        lastSeen: new Date(),
      });
    }

    // Alert yaratish
    const newAlert = new this.alertModel({
      deviceId: device._id,
      username: createAlertDto.username,
      ipAddress: createAlertDto.ipAddress,
      triggeredAt: new Date(),
    });

    const savedAlert = await newAlert.save();

    // Telegram xabar yuborish
    const message = isFirstAlert
      ? `✅ *Qurilma ulandi!*\n\n` +
        `📍 Qurilma: ${device.name}\n` +
        `👤 User: ${createAlertDto.username || "Noma'lum"}\n` +
        `🕐 Vaqt: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\n\n` +
        `Endi kompyuter yonganda xabar olasiz 📱`
      : `⚠️ *Kompyuter yondi!*\n\n` +
        `📍 Qurilma: ${device.name}\n` +
        `👤 User: ${createAlertDto.username || "Noma'lum"}\n` +
        `🕐 Vaqt: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`;

    try {
      await this.bot.telegram.sendMessage(member.telegramId, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Telegram xabar yuborishda xato:', error);
    }

    return savedAlert;
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
