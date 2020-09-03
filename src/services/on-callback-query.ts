import TelegramBot from 'node-telegram-bot-api';
import { runCommand } from './command-execute';
import { DomesticTasksBot } from './telegram-bot';

export const onCallbackQuery = async (
  bot: DomesticTasksBot,
  msg: TelegramBot.CallbackQuery
): Promise<void> => {
  const callBackData = msg.data;

  const state = bot.getCurrentState();

  if (state.currentCommand === '') {
    return;
  }

  runCommand(bot, state.currentCommand, callBackData);

};
