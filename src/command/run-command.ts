import { cleanString, trimString } from '../helpers/string';
import { Command, StateResolverFunction } from '../models/command';
import { DomesticTasksClient } from '../services/client';
import { commandExecuter } from './command-execute';

export const runCommand = async (
  client: DomesticTasksClient,
  command: Command,
  arg?: string
) => {
  const state = client.getCurrentState();
  let stateResolver: StateResolverFunction<Command>;

  const noAuthRequiredCommands: Command[] = ['help', 'cadastro'];

  const doer = await client.db.info.doer.get(client.userId);

  if (!noAuthRequiredCommands.includes(command) && !doer) {
    client.sendMessage('Para usar esse comando primera faca o /cadastro');
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

  const nextState = await stateResolver(client, cleanString(arg), trimString(arg));

  if (nextState === 'END') {
    state.currentState = 'INITIAL';
    state.currentCommand = '';
  }
  else {
    state.currentState = nextState;
    state.currentCommand = command;
  }
};
