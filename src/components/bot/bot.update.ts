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

  // Inline buttonlar (OS tanlash)
  @On('callback_query')
  async onCallback(@Ctx() ctx: any) {
    return this.botService.onCallback(ctx);
  }

  // Textlar: menu + step inputlar
  @On('text')
  async onText(@Ctx() ctx: any) {
    const text = ctx.text;
    if (!text) return;

    if (text === '➕ Qurilma qo‘shish') {
      return this.botService.startAddFlow(ctx);
    }

    if (text === '📱 Qurilmalarim') {
      return this.botService.onList(ctx);
    }

    if (text === '❓ Yordam') {
      return this.botService.onHelp(ctx);
    }

    if (text === '⬅️ Orqaga') {
      return this.botService.cancelFlow(ctx);
    }

    // Menu emas — ehtimol /add step (nom/description)
    return this.botService.onText(ctx);
  }
}
