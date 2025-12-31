import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';
import { AlertModule } from './alert/alert.module';
import { BotModule } from './bot/bot.module';
import { CronModule } from './cron/cron.module';
import { CommandModule } from './command/command.module';

@Module({
  imports: [MemberModule, DeviceModule, AlertModule, BotModule, CronModule, CommandModule]
})
export class ComponentsModule {}
