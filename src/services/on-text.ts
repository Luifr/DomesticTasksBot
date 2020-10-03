import TelegramBot from 'node-telegram-bot-api';
import {
  commands,
  Command,
} from '../models/command';
import { runCommand } from '../command/run-command';
import { DomesticTasksClient } from './client';

const botName = process.env.BOT_USERNAME;

const emptyCommandRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? *$`, 'i');
const commandWithArgRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? +(.*)$`, 'i');
const cleanMsgTextRegex = new RegExp(`^/?([^@]*@?)(?:@${botName})? *$`, 'i');

export const onText = async (
  client: DomesticTasksClient, msg: TelegramBot.Message
): Promise<void> => {
  const msgText = msg.text;
  const fromId = msg.from!.id;

  // TODO: logging/report system
  if (msg.reply_to_message) return;
  if (!msgText) {
    console.error('No message text');
    console.log(msg);
    return;
  }
  if (!fromId) {
    console.error('No user id');
    console.log(msg);
    return;
  }

  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    let responseText = 'Oie, eu so funciono em grupos\n';
    responseText += 'Crie um grupo e me adiocona la!';
    client.sendMessage(responseText);
    return;
  }

  const emptyCommandExec = emptyCommandRegex.exec(msgText);
  const commandWithArgExec = commandWithArgRegex.exec(msgText);

  const cleanMsgTextRegexResulta = cleanMsgTextRegex.exec(msgText);
  if (!cleanMsgTextRegexResulta) {
    console.error('Clean message regex failed');
    return;
  }
  const cleanMsgText = cleanMsgTextRegexResulta[1];


  const state = client.getCurrentState();

  if (cleanMsgText === '.') {
    state.context = {};
    state.currentCommand = '';
    state.currentState = 'INITIAL';
    return;
  }


  if (state.currentCommand !== '' && state.currentState !== '') {
    runCommand(client, state.currentCommand, cleanMsgText);
  }
  else if (emptyCommandExec) {
    const command = emptyCommandExec[1] as Command;
    runCommand(client, command);
  }
  else if (commandWithArgExec) {
    const command = commandWithArgExec[1] as Command;
    const arg = commandWithArgExec[2];
    runCommand(client, command, arg);
  }
  else {
    // Command not found
    client.sendMessage(`Comando \`${cleanMsgText}\` não encontrado`, { parse_mode: 'Markdown' });
  }

};
