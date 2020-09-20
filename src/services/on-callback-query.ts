import TelegramBot from 'node-telegram-bot-api';
import { runCommand } from '../command/run-command';
import { DomesticTasksClient } from './client';

export const onCallbackQuery = async (
  client: DomesticTasksClient,
  msg: TelegramBot.CallbackQuery
): Promise<void> => {
  const callBackData = msg.data;

  const state = client.getCurrentState();

  if (state.currentCommand === '') {
    return;
  }

  runCommand(client, state.currentCommand, callBackData);

};
