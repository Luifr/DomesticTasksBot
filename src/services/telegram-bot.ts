process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { onText } from './event-listener/on-text';
import { stateMachine } from './command-state-machine';


const isProd = process.env.NODE_ENV === 'production';
const PORT = +process.env.PORT! || 3000;

const botToken = process.env.BOT_TOKEN!;
const herokuUrl = process.env.HEROKU_URL!;

let telegramBot: TelegramBot;
if (isProd) {
  telegramBot = new TelegramBot(botToken, { webHook: { port: PORT } });
  telegramBot.setWebHook(`${herokuUrl}/bot${botToken}`);
}
else {
  telegramBot = new TelegramBot(botToken, { polling: true });
}

telegramBot.on('text', async (msg) => {
  const bot = new DomesticTasksBot(msg);
  await onText(bot, msg);
});

console.log('DomesticTasks started running');

export class DomesticTasksBot {

  public userId: number | undefined;
  private chatId: number;
  public chatType: TelegramBot.ChatType;

  constructor(msg: TelegramBot.Message) {


    this.userId = msg.from?.id;
    this.chatId = msg.chat.id;
    this.chatType = msg.chat.type;
  }

  sendMessage = (text: string, options?: TelegramBot.SendMessageOptions) => {
    telegramBot.sendMessage(
      this.chatId,
      text,
      options ?? { reply_markup: { remove_keyboard: true }, parse_mode: 'Markdown' }
    );
  }

  getCurrentState = <T = any>() => {
    return stateMachine.getState<T>(this.chatId, this.userId!);
  }

}
