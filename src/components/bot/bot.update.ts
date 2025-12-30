import { Update, Start, Command, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  // on start command
  @Start()
  async onStart(@Ctx() input: Context) {
    console.log('Bot: /start');
    return this.botService.onStart(input);
  }

  // on add command
  @Command('add')
  async onAdd(@Ctx() input: Context) {
    console.log('Bot: /add');
    return this.botService.onAdd(input);
  }

  @Command('list')
  async onList(@Ctx() input: Context) {
    console.log('Bot: /list');
    return this.botService.onList(input);
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context) {
    console.log('Bot: /help');
    return this.botService.onHelp(ctx);
  }
}
