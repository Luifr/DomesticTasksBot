import { normaliseString } from '../../../helpers/string';
import { Command, StateResolverFunction } from '../../../models/command';
import { DomesticTasksBot } from '../../telegram-bot';
import { commandExecuter } from './command-execute';

export const runCommand = async (
  bot: DomesticTasksBot,
  command: Command,
  arg?: string
) => {
  const state = bot.getCurrentState();
  let stateResolver: StateResolverFunction<Command>;

  const noAuthRequiredCommands: Command[] = ['help', 'cadastro'];

  if (state.currentCommand === '') {
    console.error('Nao devia ser isso não');
    return;
  }
  if (noAuthRequiredCommands.indexOf(state.currentCommand)) {
    bot.sendMessage('Voce não está autorizado a usar '); // TODO: auth
    return;
  }

  if (state.currentState === 'INITIAL' && typeof commandExecuter[command] === 'function') {
    // @ts-ignore
    stateResolver = await commandExecuter[command];
  }
  else {
    // @ts-ignore
    stateResolver = await commandExecuter[command][state.currentState];
  }

  const nextState = await stateResolver(bot, normaliseString(arg));

  if (nextState === 'END') {
    state.currentState = 'INITIAL';
    state.currentCommand = '';
  }
  else {
    state.currentState = nextState;
    state.currentCommand = command;
  }
};
