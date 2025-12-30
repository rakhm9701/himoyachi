import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [MemberModule, DeviceModule, AlertModule]
})
export class ComponentsModule {}
