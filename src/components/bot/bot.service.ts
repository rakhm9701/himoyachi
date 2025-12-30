import { Injectable } from '@nestjs/common';
import { MemberService } from '../member/member.service';
import { DeviceService } from '../device/device.service';
import { Context } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    private readonly memberService: MemberService,
    private readonly deviceService: DeviceService,
  ) {}

  // on start commnand
  async onStart(input: Context) {
    if (!input.from) {
      return input.reply('❌ Xatolik yuz berdi');
    }
    const telegramId = input.from.id.toString();
    const username = input.from.username || '';
    const firstName = input.from.first_name || '';
    let member = await this.memberService.findByTelegramId(telegramId);

    if (!member) {
      member = await this.memberService.createMember({
        telegramId,
        username,
        firstName,
      });
      await input.reply(
        `🎉 Xush kelibsiz, ${firstName}!\n\n` +
          `Himoyachi Bot - kompyuteringizni nazorat qiling.\n\n` +
          `📌 Buyruqlar:\n` +
          `/add - Yangi qurilma qo'shish\n` +
          `/list - Qurilmalarim ro'yxati`,
      );
    } else {
      await input.reply(
        `👋 Salom, ${firstName}!\n\n` +
          `📌 Buyruqlar:\n` +
          `/add - Yangi qurilma qo'shish\n` +
          `/list - Qurilmalarim ro'yxati`,
      );
    }
  }

  // /add - Qurilma qo'shish
  async onAdd(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply('❌ Xatolik yuz berdi');
    }

    const telegramId = ctx.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);

    if (!member) {
      return ctx.reply('❌ Avval /start bosing');
    }

    // Yangi device yaratish
    const device = await this.deviceService.create({
      memberId: (member as any)._id.toString(),
      name: 'Yangi qurilma',
    });

    await ctx.reply(
      `✅ Qurilma qo'shildi!\n\n` +
        `🔑 Sizning kalitingiz: \`${device.deviceKey}\`\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 *Qanday sozlash kerak?*\n\n` +
        `*1-qadam:* Terminalda shu buyruqni kiriting:\n\n` +
        `\`\`\`\n` +
        `nano ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*2-qadam:* Quyidagi kodni yozing:\n\n` +
        `\`\`\`\n` +
        `#!/bin/bash\n` +
        `curl -X POST https://api.himoyachi.uz/alert \\\n` +
        `  -H "Content-Type: application/json" \\\n` +
        `  -d '{"deviceKey":"${device.deviceKey}","username":"'$(whoami)'"}'\n` +
        `\`\`\`\n\n` +
        `*3-qadam:* Saqlash: \`Ctrl+O\` → Enter → \`Ctrl+X\`\n\n` +
        `*4-qadam:* Ruxsat berish:\n` +
        `\`\`\`\n` +
        `chmod +x ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*5-qadam:* Avtomatik ishga tushirish uchun /setup bosing\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📱 Qurilmalarim: /list\n` +
        `❓ Yordam: /help`,
      { parse_mode: 'Markdown' },
    );
  }

  async onList(input: Context) {
    if (!input.from) {
      return input.reply('❌ Xatolik yuz berdi!');
    }
    const telegramId = input.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) {
      return input.reply('❌ Avval /start bosing!');
    }
    const { device, count } = await this.deviceService.findByMemberId(
      (member as any)._id.toString(),
    );

    if (count === 0) {
      return input.reply(
        `📱 Sizda hali qurilma yo'q.\n\n` + `/add - Yangi qurilma qo'shish`,
      );
    }

    let message = `📱 Sizning qurilmalaringiz (${count}):\n\n`;

    device.forEach((d, index) => {
      message += `${index + 1}. ${d.name}\n`;
      message += `   🔑 Kalit: \`${d.deviceKey}\`\n`;
      message += `   💻 OS: ${d.osType}\n`;
      message += `   📊 Status: ${d.status}\n\n`;
    });

    await input.reply(message, { parse_mode: 'Markdown' });
  }

  // /help - Yordam
  async onHelp(ctx: Context) {
    await ctx.reply(
      `🛡 *Himoyachi Bot - Yordam*\n\n` +
        `Bu bot orqali kompyuteringizni nazorat qilishingiz mumkin.\n\n` +
        `*Asosiy buyruqlar:*\n\n` +
        `🚀 /start - Botni boshlash\n` +
        `➕ /add - Yangi qurilma qo'shish\n` +
        `📱 /list - Qurilmalarim ro'yxati\n` +
        `❓ /help - Yordam\n\n` +
        `*Qanday ishlaydi?*\n\n` +
        `1. /add orqali qurilma qo'shing\n` +
        `2. Berilgan kalitni kompyuteringizga o'rnating\n` +
        `3. Kimdir kompyuterni yoqsa - sizga xabar keladi 📱\n\n` +
        `*Savol bormi?*\n` +
        `👉 @himoyachi_support`,
      { parse_mode: 'Markdown' },
    );
  }
}
