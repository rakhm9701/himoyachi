import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';

import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { MemberModule } from '../member/member.module';
import { DeviceModule } from '../device/device.module';
import { CommandModule } from '../command/command.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
      }),
      inject: [ConfigService],
    }),
    MemberModule,
    DeviceModule,
    CommandModule,
  ],
  providers: [BotUpdate, BotService],
})
export class BotModule {}
