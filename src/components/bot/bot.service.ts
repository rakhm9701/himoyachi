import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { MemberService } from '../member/member.service';
import { DeviceService } from '../device/device.service';
import { DeviceOS } from 'src/libs/enum/device.enum';

const mainMenu = Markup.keyboard([
  ['➕ Qurilma qoshish'],
  ['📱 Qurilmalarim'],
  ['❓ Yordam'],
]).resize();

const backMenu = Markup.keyboard([['⬅️ Orqaga']]).resize();

// ====== ADD FLOW STATE ======
type AddStep = 'idle' | 'await_name' | 'await_os' | 'await_desc';

type AddFlowState = {
  step: AddStep;
  name?: string;
  osType?: DeviceOS;
  description?: string;
};

@Injectable()
export class BotService {
  constructor(
    private readonly memberService: MemberService,
    private readonly deviceService: DeviceService,
  ) {}

  private addFlow = new Map<string, AddFlowState>();
  private renameFlow = new Map<string, string>(); // telegramId -> deviceId

  private getTid(ctx: Context): string | null {
    return ctx.from?.id ? ctx.from.id.toString() : null;
  }

  async showMenu(ctx: Context) {
    await ctx.reply('📋 Menu:', mainMenu);
  }

  async cancelFlow(ctx: Context) {
    const tid = this.getTid(ctx);
    if (tid) {
      this.addFlow.delete(tid);
      this.renameFlow.delete(tid);
    }
    await this.showMenu(ctx);
  }

  async onStart(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Xatolik yuz berdi');

    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const firstName = ctx.from.first_name || '';

    let member = await this.memberService.findByTelegramId(telegramId);
    if (!member) {
      await this.memberService.createMember({
        telegramId,
        username,
        firstName,
      });
    }

    await ctx.reply(
      `👋 Salom, ${firstName}!\n\nHimoyachi Bot - kompyuteringizni nazorat qiling.`,
      mainMenu,
    );
  }

  // ===== /help =====
  async onHelp(ctx: Context) {
    await ctx.reply(
      `🛡 Himoyachi Bot - Yordam

Asosiy buyruqlar:
/start - Botni boshlash
/add - Yangi qurilma qo'shish
/list - Qurilmalarim
/help - Yordam

Qanday ishlaydi?
1) /add orqali qurilma qo'shasiz
2) Bot kalit beradi
3) Kompyuter signal yuborsa — sizga xabar keladi

Savol bo'lsa: @odilov07ko`,
      backMenu,
    );
  }

  // ===== /list =====
  async onList(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Xatolik yuz berdi!');

    const telegramId = ctx.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply('❌ Avval /start bosing!');

    const { device, count } = await this.deviceService.findByMemberId(
      (member as any)._id.toString(),
    );

    if (count === 0) {
      return ctx.reply(
        `📱 Sizda hali qurilma yo'q.\n\n/add - Yangi qurilma qo'shish`,
        Markup.keyboard([["➕ Qurilma qo'shish"], ['❓ Yordam']]).resize(),
      );
    }

    for (const d of device) {
      const statusEmoji =
        d.status === 'active' ? '🟢' : d.status === 'pending' ? '🟡' : '🔴';

      const message =
        `📍 *${d.name}*\n\n` +
        `🔑 Kalit: \`${d.deviceKey}\`\n` +
        `💻 OS: ${d.osType}\n` +
        `${statusEmoji} Status: ${d.status}`;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✏️ Nomini o'zgartirish",
              `rename:${(d as any)._id}`,
            ),
            Markup.button.callback("🗑 O'chirish", `delete:${(d as any)._id}`),
          ],
        ]),
      });
    }

    await ctx.reply(`📱 Jami: ${count} ta qurilma`, mainMenu);
  }

  async startAddFlow(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Xatolik yuz berdi');

    const telegramId = ctx.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply('❌ Avval /start bosing');

    this.addFlow.set(telegramId, { step: 'await_name' });

    await ctx.reply('📛 Qurilma nomini kiriting:', backMenu);
  }

  // text handler for steps
  async onText(ctx: any) {
    const tid = this.getTid(ctx);
    if (!tid) return;

    const text = (ctx.text || '').trim();

    // Rename flow tekshirish
    const renameDeviceId = this.renameFlow.get(tid);
    if (renameDeviceId) {
      if (text.length < 2) {
        return ctx.reply(
          "❌ Nom kamida 2 ta belgi bo'lishi kerak. Qayta kiriting:",
        );
      }

      try {
        await this.deviceService.update(renameDeviceId, { name: text });
        this.renameFlow.delete(tid);
        await ctx.reply(`✅ Qurilma nomi o'zgartirildi: *${text}*`, {
          parse_mode: 'Markdown',
        });
        return this.showMenu(ctx);
      } catch (error) {
        console.error('Rename update error:', error);
        this.renameFlow.delete(tid);
        return ctx.reply('❌ Xatolik yuz berdi');
      }
    }

    // Add flow davomi
    const state = this.addFlow.get(tid);
    if (!state || state.step === 'idle') return;

    // 1) name
    if (state.step === 'await_name') {
      const name = (ctx.text || '').trim();
      if (!name || name.length < 2) {
        return ctx.reply("❌ Qurilma nomi noto'gri. Qayta kiriting:", backMenu);
      }

      state.name = name;
      state.step = 'await_os';
      this.addFlow.set(tid, state);

      return ctx.reply(
        '💻 OS tanlang:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🐧 Linux', 'os:linux'),
            Markup.button.callback('🪟 Windows', 'os:windows'),
            Markup.button.callback('🍎 Mac', 'os:mac'),
          ],
          [Markup.button.callback('⬅️ Orqaga', 'flow:cancel')],
        ]),
      );
    }

    // 3) description
    if (state.step === 'await_desc') {
      const desc = (ctx.text || '').trim();
      state.description = desc === '-' ? '' : desc;

      // create device
      const member = await this.memberService.findByTelegramId(tid);
      if (!member) {
        this.addFlow.delete(tid);
        return ctx.reply('❌ Avval /start bosing');
      }

      const device = await this.deviceService.create({
        memberId: (member as any)._id.toString(),
        name: state.name!,
        osType: state.osType,
        description: state.description,
      } as any);

      this.addFlow.delete(tid);

      await ctx.reply(
        `✅ Qurilma qo'shildi!

🔑 Sizning kalitingiz: ${device.deviceKey}

━━━━━━━━━━━━━━━━━━━━━

📋 Qanday sozlash kerak?

1-qadam: Terminalda shu buyruqni kiriting:

nano ~/himoyachi.sh

2-qadam: Quyidagi kodni yozing:

#!/bin/bash
curl -X POST https://api.himoyachi.uz/alert \\
  -H "Content-Type: application/json" \\
  -d '{"deviceKey":"${device.deviceKey}","username":"'$(whoami)'"}'

3-qadam: Saqlash: Ctrl+O → Enter → Ctrl+X

4-qadam: Ruxsat berish:
chmod +x ~/himoyachi.sh

5-qadam: Avtomatik ishga tushirish uchun /setup bosing

━━━━━━━━━━━━━━━━━━━━━

📱 Qurilmalarim: /list
❓ Yordam: /help`,
        mainMenu,
      );

      return;
    }
  }

  // callback handler for inline buttons
  async onCallback(ctx: any) {
    const tid = this.getTid(ctx);
    if (!tid) return;

    const data = ctx.callbackQuery?.data;
    if (!data) return;

    try {
      await ctx.answerCbQuery();
    } catch {}

    // Cancel flow
    if (data === 'flow:cancel') {
      return this.cancelFlow(ctx);
    }

    // OS tanlash
    if (data.startsWith('os:')) {
      const state = this.addFlow.get(tid);
      if (!state || state.step !== 'await_os') {
        return ctx.reply(
          '❌ Jarayon topilmadi. /add ni qayta bosing.',
          mainMenu,
        );
      }

      const os = data.replace('os:', '') as DeviceOS;
      state.osType = os;
      state.step = 'await_desc';
      this.addFlow.set(tid, state);

      try {
        await ctx.editMessageText(
          `✅ OS tanlandi: ${os}\n\n📝 Izoh kiriting (yoki "-" yozing):`,
        );
      } catch {
        await ctx.reply(
          `✅ OS tanlandi: ${os}\n\n📝 Izoh kiriting (yoki "-" yozing):`,
        );
      }
      return;
    }

    // Delete qurilma
    if (data.startsWith('delete:')) {
      const deviceId = data.replace('delete:', '');

      try {
        const device = await this.deviceService.findById(deviceId);
        if (!device) {
          return ctx.reply('❌ Qurilma topilmadi');
        }

        await ctx.editMessageText(`🗑 *${device.name}* ni o'chirmoqchimisiz?`, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "✅ Ha, o'chirish",
                `confirm_delete:${deviceId}`,
              ),
              Markup.button.callback("❌ Yo'q", `cancel_delete:${deviceId}`),
            ],
          ]),
        });
      } catch (error) {
        console.error('Delete error:', error);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
      return;
    }

    // Confirm delete
    if (data.startsWith('confirm_delete:')) {
      const deviceId = data.replace('confirm_delete:', '');

      try {
        await this.deviceService.delete(deviceId);
        await ctx.editMessageText("✅ Qurilma o'chirildi!");
      } catch (error) {
        console.error('Confirm delete error:', error);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
      return;
    }

    // Cancel delete
    if (data.startsWith('cancel_delete:')) {
      await ctx.editMessageText('❌ Bekor qilindi');
      return;
    }

    // Rename qurilma
    if (data.startsWith('rename:')) {
      const deviceId = data.replace('rename:', '');

      try {
        const device = await this.deviceService.findById(deviceId);
        if (!device) {
          return ctx.reply('❌ Qurilma topilmadi');
        }

        this.renameFlow.set(tid, deviceId);
        await ctx.editMessageText(
          `✏️ *${device.name}* uchun yangi nom kiriting:`,
          { parse_mode: 'Markdown' },
        );
      } catch (error) {
        console.error('Rename error:', error);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
      return;
    }

    // Til tanlash
    if (data.startsWith('lang:')) {
      const lang = data.replace('lang:', '');

      try {
        const member = await this.memberService.findByTelegramId(tid);
        if (!member) {
          return ctx.reply('❌ Avval /start bosing');
        }

        await this.memberService.update((member as any)._id.toString(), {
          language: lang,
        });

        const messages: Record<string, string> = {
          uz: "✅ Til o'zgartirildi: O'zbek",
          ru: '✅ Язык изменён: Русский',
          en: '✅ Language changed: English',
        };

        await ctx.editMessageText(messages[lang] || messages['uz']);
      } catch (error) {
        console.error('Lang error:', error);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
      return;
    }
  }

  // /setup - Avtomatik ishga tushirish yo'riqnomasi
  async onSetup(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Xatolik yuz berdi');

    const telegramId = ctx.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply('❌ Avval /start bosing');

    const { device, count } = await this.deviceService.findByMemberId(
      (member as any)._id.toString(),
    );

    if (count === 0) {
      return ctx.reply("❌ Avval /add orqali qurilma qo'shing");
    }

    // Oxirgi qo'shilgan qurilma
    const lastDevice = device[device.length - 1];
    const deviceKey = lastDevice.deviceKey;
    const osType = lastDevice.osType;

    let message = '';

    if (osType === 'mac') {
      message =
        `⚙️ *Mac uchun sozlash*\n\n` +
        `*1-qadam:* Script yaratish\n` +
        `\`\`\`\n` +
        `nano ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*2-qadam:* Quyidagini yozing:\n` +
        `\`\`\`\n` +
        `#!/bin/bash\n` +
        `curl -s -X POST http://localhost:4001/alert \\\n` +
        `  -H "Content-Type: application/json" \\\n` +
        `  -d '{"deviceKey":"${deviceKey}","username":"'$(whoami)'"}'\n` +
        `\`\`\`\n\n` +
        `*3-qadam:* Saqlash va ruxsat\n` +
        `\`\`\`\n` +
        `chmod +x ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*4-qadam:* Avtomatik ishga tushirish\n` +
        `\`\`\`\n` +
        `nano ~/Library/LaunchAgents/com.himoyachi.plist\n` +
        `\`\`\`\n\n` +
        `Ichiga yozing:\n` +
        `\`\`\`\n` +
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
        `<plist version="1.0">\n` +
        `<dict>\n` +
        `  <key>Label</key>\n` +
        `  <string>com.himoyachi</string>\n` +
        `  <key>ProgramArguments</key>\n` +
        `  <array>\n` +
        `    <string>/bin/bash</string>\n` +
        `    <string>${process.env.HOME}/himoyachi.sh</string>\n` +
        `  </array>\n` +
        `  <key>RunAtLoad</key>\n` +
        `  <true/>\n` +
        `</dict>\n` +
        `</plist>\n` +
        `\`\`\`\n\n` +
        `*5-qadam:* Faollashtirish\n` +
        `\`\`\`\n` +
        `launchctl load ~/Library/LaunchAgents/com.himoyachi.plist\n` +
        `\`\`\`\n\n` +
        `✅ Tayyor!`;
    } else if (osType === 'windows') {
      message =
        `⚙️ *Windows uchun sozlash*\n\n` +
        `*1-qadam:* PowerShell script yaratish\n` +
        `Notepad oching va quyidagini yozing:\n` +
        `\`\`\`\n` +
        `$body = @{\n` +
        `  deviceKey = "${deviceKey}"\n` +
        `  username = $env:USERNAME\n` +
        `} | ConvertTo-Json\n` +
        `Invoke-RestMethod -Uri "http://localhost:4001/alert" -Method Post -Body $body -ContentType "application/json"\n` +
        `\`\`\`\n\n` +
        `*2-qadam:* Saqlash\n` +
        `\`C:\\himoyachi.ps1\` sifatida saqlang\n\n` +
        `*3-qadam:* Avtomatik ishga tushirish\n` +
        `\`Win + R\` → \`shell:startup\`\n` +
        `Shu papkaga shortcut yarating:\n` +
        `\`\`\`\n` +
        `powershell -ExecutionPolicy Bypass -File C:\\himoyachi.ps1\n` +
        `\`\`\`\n\n` +
        `✅ Tayyor!`;
    } else if (osType === 'linux') {
      message =
        `⚙️ *Linux uchun sozlash*\n\n` +
        `*1-qadam:* Script yaratish\n` +
        `\`\`\`\n` +
        `nano ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*2-qadam:* Quyidagini yozing:\n` +
        `\`\`\`\n` +
        `#!/bin/bash\n` +
        `curl -s -X POST http://localhost:4001/alert \\\n` +
        `  -H "Content-Type: application/json" \\\n` +
        `  -d '{"deviceKey":"${deviceKey}","username":"'$(whoami)'"}'\n` +
        `\`\`\`\n\n` +
        `*3-qadam:* Saqlash va ruxsat\n` +
        `\`\`\`\n` +
        `chmod +x ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `*4-qadam:* Avtomatik ishga tushirish\n` +
        `\`\`\`\n` +
        `crontab -e\n` +
        `\`\`\`\n\n` +
        `Oxiriga qo'shing:\n` +
        `\`\`\`\n` +
        `@reboot /bin/bash ~/himoyachi.sh\n` +
        `\`\`\`\n\n` +
        `✅ Tayyor!`;
    } else {
      message = `❌ OS aniqlanmadi. /add orqali qayta qurilma qo'shing.`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  // /stats - Statistika
  async onStats(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Xatolik yuz berdi');

    const telegramId = ctx.from.id.toString();
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply('❌ Avval /start bosing');

    const { device, count: deviceCount } =
      await this.deviceService.findByMemberId((member as any)._id.toString());

    const activeDevices = device.filter((d) => d.status === 'active').length;
    const pendingDevices = device.filter((d) => d.status === 'pending').length;
    const inactiveDevices = device.filter(
      (d) => d.status === 'inactive',
    ).length;

    // Alertlar sonini olish uchun alertService kerak bo'ladi
    let totalAlerts = 0;
    for (const d of device) {
      const alerts = await this.deviceService.getAlertCount(
        (d as any)._id.toString(),
      );
      totalAlerts += alerts;
    }

    const message =
      `📊 *Statistika*\n\n` +
      `📱 *Qurilmalar:* ${deviceCount} ta\n` +
      `   🟢 Active: ${activeDevices}\n` +
      `   🟡 Pending: ${pendingDevices}\n` +
      `   🔴 Inactive: ${inactiveDevices}\n\n` +
      `🔔 *Jami alertlar:* ${totalAlerts} ta\n\n` +
      `📅 Ro'yxatdan o'tgan: ${new Date((member as any).createdAt).toLocaleDateString('uz-UZ')}`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  // /lang - Til tanlash
  async onLang(ctx: Context) {
    await ctx.reply(
      `🌐 Tilni tanlang / Выберите язык / Choose language:`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🇺🇿 O'zbek", 'lang:uz'),
          Markup.button.callback('🇷🇺 Русский', 'lang:ru'),
          Markup.button.callback('🇬🇧 English', 'lang:en'),
        ],
      ]),
    );
  }
}
