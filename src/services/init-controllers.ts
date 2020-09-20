import { isProd } from '../helpers';
import { DomesticTasksClient } from './client';
import { onCallbackQuery } from './on-callback-query';
import { onText } from './on-text';
import { initReminders } from './task-reminder';
import { getTelegramBot } from './telegram-bot';

const telegramBot = getTelegramBot();

telegramBot.on('text', async (msg) => {

  if (!msg.from) {
    return;
  }

  const bot = new DomesticTasksClient({ message: msg });
  await onText(bot, msg);
});

telegramBot.on('callback_query', async (msg) => {

  if (!msg.message) {
    console.error('No message in callback query');
    return;
  }

  const bot = new DomesticTasksClient({ callbackMessage: msg });
  await onCallbackQuery(bot, msg);
});

if (isProd) {
  initReminders();
}

console.log('DomesticTasks started running');
