import TelegramBot from 'node-telegram-bot-api';
import { isProd } from '../helpers';

const PORT = +process.env.PORT! || 3000;

const botToken = process.env.BOT_TOKEN!;

let telegramBot: TelegramBot;
if (isProd) {
  const herokuUrl = process.env.HEROKU_URL!;
  telegramBot = new TelegramBot(botToken, { webHook: { port: PORT } });
  telegramBot.setWebHook(`${herokuUrl}/bot${botToken}`);
}
else {
  telegramBot = new TelegramBot(botToken, { polling: true });
}

export const getTelegramBot = () => {
  return telegramBot;
};
