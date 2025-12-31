import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Screenshot, ScreenshotDocument } from '../../entity/screenshot.entity';
import { Device, DeviceDocument } from '../../entity/device.entity';

import { Member, MemberDocument } from '../../entity/member.entity';
import { CommandStatus } from '../../libs/enum/command.enum';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Command, CommandDocument } from 'src/entity/command.enitit';

@Injectable()
export class ScreenshotService {
  private bot: Telegraf;

  constructor(
    @InjectModel(Screenshot.name)
    private screenshotModel: Model<ScreenshotDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Command.name) private commandModel: Model<CommandDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private configService: ConfigService,
  ) {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
    );
  }

  async upload(
    deviceKey: string,
    commandId: string,
    file: Express.Multer.File,
  ): Promise<Screenshot> {
    // Device topish
    const device = await this.deviceModel.findOne({ deviceKey });
    if (!device) {
      throw new NotFoundException('Device topilmadi');
    }

    // Command topish
    const command = await this.commandModel.findById(commandId);
    if (!command) {
      throw new NotFoundException('Command topilmadi');
    }

    // Screenshot saqlash
    const screenshot = new this.screenshotModel({
      deviceId: device._id,
      commandId: command._id,
      filename: file.filename,
      path: file.path,
      size: file.size,
    });
    await screenshot.save();

    // Command'ni executed qilish
    await this.commandModel.findByIdAndUpdate(commandId, {
      status: CommandStatus.EXECUTED,
      executedAt: new Date(),
    });

    // Userga screenshot yuborish
    const member = await this.memberModel.findById(device.memberId);
    if (member) {
      try {
        await this.bot.telegram.sendDocument(
          member.telegramId,
          {
            source: fs.createReadStream(file.path),
            filename: 'screenshot.jpg',
          },
          {
            caption: `📸 Screenshot: ${device.name}\n🕐 Vaqt: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`,
          },
        );
      } catch (error) {
        console.error('Screenshot yuborishda xato:', error);
      }
    }

    return screenshot;
  }
}
