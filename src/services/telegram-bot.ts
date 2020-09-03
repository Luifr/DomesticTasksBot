process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { onText } from './on-text';
import { stateMachine } from './command/command-state-machine';
import { GroupController } from '../controllers/group';
import { getGroudDbController } from './group-db';
import { onCallbackQuery } from './on-callback-query';


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

  if (!msg.from) {
    return;
  }

  const bot = new DomesticTasksBot(msg, msg.chat, msg.message_id);
  await onText(bot, msg);
});

telegramBot.on('callback_query', async (msg) => {

  if (!msg.message) {
    console.error('No message in callback query');
    return;
  }

  const bot = new DomesticTasksBot(msg, msg.message.chat, msg.message.message_id);
  await onCallbackQuery(bot, msg);
});

console.log('DomesticTasks started running');

export class DomesticTasksBot {

  public db: GroupController;
  private chatId: number;
  public chatType: TelegramBot.ChatType;
  private messageId: number | undefined;

  public userId: number;
  public name: string;
  public arroba: string | undefined;

  constructor(
    msg: TelegramBot.Message | TelegramBot.CallbackQuery,
    chat: TelegramBot.Chat,
    messageId?: number
  ) {

    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    this.arroba = msg.from!.username;
    this.chatId = chat.id;
    this.chatType = chat.type;
    this.messageId = messageId;
    this.db = getGroudDbController(this.chatId);

  }

  sendMessage = (text: string, options?: TelegramBot.SendMessageOptions) => {
    options = options ?? { reply_markup: { remove_keyboard: true } };
    telegramBot.sendMessage(
      this.chatId,
      text,
      { ...{ parse_mode: 'Markdown' }, ...options }
    );
  }

  editMessage = (text: string, options?: TelegramBot.EditMessageTextOptions) => {
    telegramBot.editMessageText(
      text,
      {
        ...{ chat_id: this.chatId, message_id: this.messageId },
        ...options
      }
    );
  }

  getCurrentState = <T = any>() => {
    return stateMachine.getState<T>(this.chatId, this.userId!);
  }

}
