import Axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { isProd } from '../helpers';
import { msInAMinute } from '../helpers/date';

const PORT = +process.env.PORT! || 3000;

const botToken = process.env.BOT_TOKEN!;

const pingHeroku = (herokuUrl: string) => {
  setTimeout(() => {
    try {
      Axios.get(herokuUrl);
    }
    finally {
      pingHeroku(herokuUrl);
    }
  }, msInAMinute * 25);
};

let telegramBot: TelegramBot;
if (isProd) {
  const herokuApp = process.env.HEROKU_APP!;
  const herokuUrl = `https://${herokuApp}.herokuapp.com//bot${botToken}`;
  telegramBot = new TelegramBot(botToken, { webHook: { port: PORT } });
  telegramBot.setWebHook(herokuUrl);
  pingHeroku(herokuUrl);
}
else {
  telegramBot = new TelegramBot(botToken, { polling: true });
}

export const getTelegramBot = () => {
  return telegramBot;
};
