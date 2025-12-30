import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../../entity/device.entity';
import { Member, MemberDocument } from '../../entity/member.entity';
import { DeviceStatus } from '../../libs/enum/device.enum';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronService {
  private bot: Telegraf;

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private configService: ConfigService,
  ) {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkOfflineDevices() {
    console.log('Cron: Offline qurilmalarni tekshirish...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Active bo'lib, 24 soatdan beri signal bermagan qurilmalar
    const offlineDevices = await this.deviceModel.find({
      status: DeviceStatus.ACTIVE,
      lastSeen: { $lt: twentyFourHoursAgo },
    });

    console.log(`Topildi: ${offlineDevices.length} ta offline qurilma`);

    for (const device of offlineDevices) {
      // Status ni inactive qilish
      await this.deviceModel.findByIdAndUpdate(device._id, {
        status: DeviceStatus.INACTIVE,
      });

      // Foydalanuvchiga xabar yuborish
      const member = await this.memberModel.findById(device.memberId);
      if (member) {
        const lastSeenDate = device.lastSeen
          ? new Date(device.lastSeen).toLocaleString('uz-UZ', {
              timeZone: 'Asia/Tashkent',
            })
          : "Noma'lum";

        const message =
          `⚠️ *Qurilma offline!*\n\n` +
          `📍 Qurilma: ${device.name}\n` +
          `🕐 Oxirgi signal: ${lastSeenDate}\n\n` +
          `Tekshiring:\n` +
          `• Kompyuter yoniqmi?\n` +
          `• Internet bormi?\n` +
          `• Script ishlayaptimi?`;

        try {
          await this.bot.telegram.sendMessage(member.telegramId, message, {
            parse_mode: 'Markdown',
          });
          console.log(`Xabar yuborildi: ${member.telegramId}`);
        } catch (error) {
          console.error('Telegram xabar yuborishda xato:', error);
        }
      }
    }
  }
}
