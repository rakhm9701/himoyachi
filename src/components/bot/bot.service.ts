import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { MemberService } from '../member/member.service';
import { DeviceService } from '../device/device.service';
import { DeviceOS } from 'src/libs/enum/device.enum';
import { t, Lang } from '../../libs/i18n/messages';

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
  private renameFlow = new Map<string, string>();

  private getTid(ctx: Context): string | null {
    return ctx.from?.id ? ctx.from.id.toString() : null;
  }

  // User tilini olish
  private async getLang(tid: string): Promise<Lang> {
    const member = await this.memberService.findByTelegramId(tid);
    return ((member as any)?.language as Lang) || 'uz';
  }

  // Dinamik menu
  private getMainMenu(lang: Lang) {
    return Markup.keyboard([
      [t(lang, 'btnAdd'), t(lang, 'btnDevices'), t(lang, 'btnStats')],
      [t(lang, 'btnLang'), t(lang, 'btnHelp')],
    ]).resize();
  }

  private getBackMenu(lang: Lang) {
    return Markup.keyboard([[t(lang, 'btnBack')]]).resize();
  }

  async showMenu(ctx: Context) {
    const tid = this.getTid(ctx);
    if (!tid) return;
    const lang = await this.getLang(tid);
    await ctx.reply(t(lang, 'menu'), this.getMainMenu(lang));
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
    if (!ctx.from) return ctx.reply('❌ Error');

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

    const lang = await this.getLang(telegramId);
    await ctx.reply(
      t(lang, 'welcome', { name: firstName }),
      this.getMainMenu(lang),
    );
  }

  async onHelp(ctx: Context) {
    const tid = this.getTid(ctx);
    if (!tid) return;
    const lang = await this.getLang(tid);
    await ctx.reply(t(lang, 'help'), this.getBackMenu(lang));
  }

  async onList(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Error');

    const telegramId = ctx.from.id.toString();
    const lang = await this.getLang(telegramId);
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply(t(lang, 'startFirst'));

    const { device, count } = await this.deviceService.findByMemberId(
      (member as any)._id.toString(),
    );

    if (count === 0) {
      return ctx.reply(t(lang, 'noDevices'), this.getMainMenu(lang));
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
              t(lang, 'btnRename'),
              `rename:${(d as any)._id}`,
            ),
            Markup.button.callback(
              t(lang, 'btnDelete'),
              `delete:${(d as any)._id}`,
            ),
          ],
        ]),
      });
    }

    await ctx.reply(t(lang, 'totalDevices', { count }), this.getMainMenu(lang));
  }

  async startAddFlow(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Error');

    const telegramId = ctx.from.id.toString();
    const lang = await this.getLang(telegramId);
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply(t(lang, 'startFirst'));

    this.addFlow.set(telegramId, { step: 'await_name' });
    await ctx.reply(t(lang, 'enterDeviceName'), this.getBackMenu(lang));
  }

  async onText(ctx: any) {
    const tid = this.getTid(ctx);
    if (!tid) return;

    const text = (ctx.text || '').trim();
    const lang = await this.getLang(tid);

    // Rename flow
    const renameDeviceId = this.renameFlow.get(tid);
    if (renameDeviceId) {
      if (text.length < 2) {
        return ctx.reply(t(lang, 'nameTooShort'));
      }

      try {
        await this.deviceService.update(renameDeviceId, { name: text });
        this.renameFlow.delete(tid);
        await ctx.reply(t(lang, 'deviceRenamed', { name: text }), {
          parse_mode: 'Markdown',
        });
        return this.showMenu(ctx);
      } catch (error) {
        console.error('Rename update error:', error);
        this.renameFlow.delete(tid);
        return ctx.reply(t(lang, 'error'));
      }
    }

    // Add flow
    const state = this.addFlow.get(tid);
    if (!state || state.step === 'idle') return;

    if (state.step === 'await_name') {
      if (!text || text.length < 2) {
        return ctx.reply(t(lang, 'invalidDeviceName'), this.getBackMenu(lang));
      }

      state.name = text;
      state.step = 'await_os';
      this.addFlow.set(tid, state);

      return ctx.reply(
        t(lang, 'selectOS'),
        Markup.inlineKeyboard([
          [
            Markup.button.callback('🐧 Linux', 'os:linux'),
            Markup.button.callback('🪟 Windows', 'os:windows'),
            Markup.button.callback('🍎 Mac', 'os:mac'),
          ],
          [Markup.button.callback(t(lang, 'btnBack'), 'flow:cancel')],
        ]),
      );
    }

    if (state.step === 'await_desc') {
      state.description = text === '-' ? '' : text;

      const member = await this.memberService.findByTelegramId(tid);
      if (!member) {
        this.addFlow.delete(tid);
        return ctx.reply(t(lang, 'startFirst'));
      }

      const device = await this.deviceService.create({
        memberId: (member as any)._id.toString(),
        name: state.name!,
        osType: state.osType,
        description: state.description,
      } as any);

      this.addFlow.delete(tid);

      await ctx.reply(
        `${t(lang, 'deviceAdded')}\n\n${t(lang, 'yourKey')} ${device.deviceKey}\n\n/setup`,
        this.getMainMenu(lang),
      );
      return;
    }
  }

  async onCallback(ctx: any) {
    const tid = this.getTid(ctx);
    if (!tid) return;

    const data = ctx.callbackQuery?.data;
    if (!data) return;
    const lang = await this.getLang(tid);

    try {
      await ctx.answerCbQuery();
    } catch {}

    if (data === 'flow:cancel') {
      return this.cancelFlow(ctx);
    }

    if (data.startsWith('os:')) {
      const state = this.addFlow.get(tid);
      if (!state || state.step !== 'await_os') {
        return ctx.reply(t(lang, 'error'), this.getMainMenu(lang));
      }

      const os = data.replace('os:', '') as DeviceOS;
      state.osType = os;
      state.step = 'await_desc';
      this.addFlow.set(tid, state);

      try {
        await ctx.editMessageText(t(lang, 'osSelected', { os }));
      } catch {
        await ctx.reply(t(lang, 'osSelected', { os }));
      }
      return;
    }

    if (data.startsWith('delete:')) {
      const deviceId = data.replace('delete:', '');

      try {
        const device = await this.deviceService.findById(deviceId);
        if (!device) {
          return ctx.reply(t(lang, 'deviceNotFound'));
        }

        await ctx.editMessageText(
          t(lang, 'confirmDelete', { name: device.name }),
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  t(lang, 'yesDelete'),
                  `confirm_delete:${deviceId}`,
                ),
                Markup.button.callback(
                  t(lang, 'noCancel'),
                  `cancel_delete:${deviceId}`,
                ),
              ],
            ]),
          },
        );
      } catch (error) {
        console.error('Delete error:', error);
        await ctx.reply(t(lang, 'error'));
      }
      return;
    }

    if (data.startsWith('confirm_delete:')) {
      const deviceId = data.replace('confirm_delete:', '');

      try {
        await this.deviceService.delete(deviceId);
        await ctx.editMessageText(t(lang, 'deviceDeleted'));
      } catch (error) {
        console.error('Confirm delete error:', error);
        await ctx.reply(t(lang, 'error'));
      }
      return;
    }

    if (data.startsWith('cancel_delete:')) {
      await ctx.editMessageText(t(lang, 'cancelled'));
      return;
    }

    if (data.startsWith('rename:')) {
      const deviceId = data.replace('rename:', '');

      try {
        const device = await this.deviceService.findById(deviceId);
        if (!device) {
          return ctx.reply(t(lang, 'deviceNotFound'));
        }

        this.renameFlow.set(tid, deviceId);
        await ctx.editMessageText(
          t(lang, 'enterNewName', { name: device.name }),
          {
            parse_mode: 'Markdown',
          },
        );
      } catch (error) {
        console.error('Rename error:', error);
        await ctx.reply(t(lang, 'error'));
      }
      return;
    }

    if (data.startsWith('lang:')) {
      const newLang = data.replace('lang:', '') as Lang;

      try {
        const member = await this.memberService.findByTelegramId(tid);
        if (!member) {
          return ctx.reply(t(lang, 'startFirst'));
        }

        await this.memberService.update((member as any)._id.toString(), {
          language: newLang as any,
        });

        await ctx.editMessageText(t(newLang, 'langChanged'));

        // Yangi til bilan menu ko'rsatish
        await ctx.reply(t(newLang, 'menu'), this.getMainMenu(newLang));
      } catch (error) {
        console.error('Lang error:', error);
        await ctx.reply(t(lang, 'error'));
      }
      return;
    }
  }

  async onSetup(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Error');

    const telegramId = ctx.from.id.toString();
    const lang = await this.getLang(telegramId);
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply(t(lang, 'startFirst'));

    const { device, count } = await this.deviceService.findByMemberId(
      (member as any)._id.toString(),
    );

    if (count === 0) {
      return ctx.reply(t(lang, 'noDevices'));
    }

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
      message = t(lang, 'error');
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  async onStats(ctx: Context) {
    if (!ctx.from) return ctx.reply('❌ Error');

    const telegramId = ctx.from.id.toString();
    const lang = await this.getLang(telegramId);
    const member = await this.memberService.findByTelegramId(telegramId);
    if (!member) return ctx.reply(t(lang, 'startFirst'));

    const { device, count: deviceCount } =
      await this.deviceService.findByMemberId((member as any)._id.toString());

    const activeDevices = device.filter((d) => d.status === 'active').length;
    const pendingDevices = device.filter((d) => d.status === 'pending').length;
    const inactiveDevices = device.filter(
      (d) => d.status === 'inactive',
    ).length;

    let totalAlerts = 0;
    for (const d of device) {
      const alerts = await this.deviceService.getAlertCount(
        (d as any)._id.toString(),
      );
      totalAlerts += alerts;
    }

    const message = t(lang, 'stats', {
      total: deviceCount,
      active: activeDevices,
      pending: pendingDevices,
      inactive: inactiveDevices,
      alerts: totalAlerts,
      date: new Date((member as any).createdAt).toLocaleDateString('uz-UZ'),
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  async onLang(ctx: Context) {
    const tid = this.getTid(ctx);
    if (!tid) return;
    const lang = await this.getLang(tid);

    await ctx.reply(
      t(lang, 'selectLang'),
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
