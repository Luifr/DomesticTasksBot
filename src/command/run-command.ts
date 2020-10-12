import { cleanString, trimString } from '../helpers/string';
import { Command, StatesOf, StateTransitionFunction } from '../models/command';
import { DomesticTasksClient } from '../services/client';
import { commandExecuter } from './command-execute';

export const runCommand = async <T extends Command>(
  client: DomesticTasksClient,
  command: T,
  arg?: string,
  isCallbackData = false
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

  const anyHandlerResult = await commandResolver.transitionHandlers.
    ANY?.({ client, cleanArg, originalArg, isCallbackData });

  const commandTransitionHandler: StateTransitionFunction<T> =
    // @ts-ignore
    commandResolver.transitionHandlers[currentState];

  const nextState = anyHandlerResult ||
    await commandTransitionHandler({ client, cleanArg, originalArg, isCallbackData });

  if (nextState !== currentState) {
    if (nextState !== state.statesStack[state.statesStack.length - 1]) {
      state.statesStack.push(nextState);
    }

    // @ts-ignore
    commandResolver.eventCallbacks?.[currentState]?.onLeave?.(client);

    // @ts-ignore eslint-ignore
    commandResolver.eventCallbacks?.[currentState]
      ?.onTransition?.[nextState]?.(client);
  }

  if (nextState === 'END') {
    commandResolver.eventCallbacks?.onEnd?.(client);
    client.resetState();
  }
  else {
    // @ts-ignore
    commandResolver.eventCallbacks?.[nextState]?.onEnter?.(client);

    state.currentState = nextState;
    state.currentCommand = command;
  }
};
