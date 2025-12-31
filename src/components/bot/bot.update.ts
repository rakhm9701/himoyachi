import { Update, Start, Command, Ctx, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
  }

  @Command('add')
  async onAdd(@Ctx() ctx: Context) {
    return this.botService.startAddFlow(ctx);
  }

  @Command('list')
  async onList(@Ctx() ctx: Context) {
    return this.botService.onList(ctx);
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context) {
    return this.botService.onHelp(ctx);
  }

  @Command('setup')
  async onSetup(@Ctx() ctx: Context) {
    console.log('Bot: /setup');
    return this.botService.onSetup(ctx);
  }

  @Command('stats')
  async onStats(@Ctx() ctx: Context) {
    console.log('Bot: /stats');
    return this.botService.onStats(ctx);
  }

  @Command('lang')
  async onLang(@Ctx() ctx: Context) {
    console.log('Bot: /lang');
    return this.botService.onLang(ctx);
  }

  @Command('shutdown')
  async onShutdown(@Ctx() ctx: Context) {
    console.log('Bot: /shutdown');
    return this.botService.onShutdown(ctx);
  }

  @Command('restart')
  async onRestart(@Ctx() ctx: Context) {
    console.log('Bot: /restart');
    return this.botService.onRestart(ctx);
  }

  @Command('lock')
  async onLock(@Ctx() ctx: Context) {
    console.log('Bot: /lock');
    return this.botService.onLock(ctx);
  }

  @Command('screenshot')
  async onScreenshot(@Ctx() ctx: Context) {
    console.log('Bot: /screenshot');
    return this.botService.onScreenshot(ctx);
  }

  // Inline buttonlar (OS tanlash)
  @On('callback_query')
  async onCallback(@Ctx() ctx: any) {
    return this.botService.onCallback(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: any) {
    const text = ctx.text;
    if (!text) return;

    // Emoji orqali aniqlash (barcha tillarda ishlaydi)
    if (text.includes('➕')) return this.botService.startAddFlow(ctx);
    if (text.includes('📱')) return this.botService.onList(ctx);
    if (text.includes('📊')) return this.botService.onStats(ctx);
    if (text.includes('🌐')) return this.botService.onLang(ctx);
    if (text.includes('❓')) return this.botService.onHelp(ctx);
    if (text.includes('⬅️')) return this.botService.cancelFlow(ctx);
    if (text.includes('⏹')) return this.botService.onShutdown(ctx);
    if (text.includes('🔄')) return this.botService.onRestart(ctx);
    if (text.includes('🔒')) return this.botService.onLock(ctx);
    if (text.includes('📸')) return this.botService.onScreenshot(ctx);

    return this.botService.onText(ctx);
  }
}
