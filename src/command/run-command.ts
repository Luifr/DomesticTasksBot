import { cleanString, trimString } from '../helpers/string';
import { Command, StatesOf, StateTransitionFunction } from '../models/command';
import { DomesticTasksClient } from '../services/client';
import { commandExecuter } from './command-execute';

export const runCommand = async <T extends Command>(
  client: DomesticTasksClient,
  command: T,
  arg?: string
) => {
  const state = client.getCurrentState();
  const currentState = state.currentState as StatesOf<T>;
  const noAuthRequiredCommands: Command[] = ['help', 'cadastro'];

  const doer = await client.db.info.doer.get(client.userId);

  if (!noAuthRequiredCommands.includes(command) && !doer) {
    client.sendMessage('Para usar esse comando primera faca o /cadastro');
    return;
  }

  const commandResolver = commandExecuter[command];

  const cleanArg = cleanString(arg);
  const originalArg = trimString(arg);

  const commandTransitionHandler: StateTransitionFunction<T> =
    // @ts-ignore
    commandResolver.transitionHandlers[currentState];

  const nextState = await commandTransitionHandler(client, cleanArg, originalArg);

  if (nextState !== currentState) {
    // @ts-ignore
    commandResolver.eventCallbacks?.[currentState]?.onLeave?.(client);

    // @ts-ignore eslint-ignore
    commandResolver.eventCallbacks?.[currentState]
      ?.onTransition?.[nextState]?.(client);
  }

  if (nextState === 'END') {
    commandResolver.eventCallbacks?.onEnd?.(client);
    state.currentState = 'INITIAL';
    state.currentCommand = '';
  }
  else {
    // @ts-ignore
    commandResolver.eventCallbacks?.[currentState]?.onEnter?.(client);

    state.currentState = nextState;
    state.currentCommand = command;
  }
};
