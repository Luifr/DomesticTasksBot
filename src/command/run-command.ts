import { cleanString, trimString } from '../helpers/string';
import {
  Command,
  CommandStateResolver,
  StatesOf,
} from '../models/command';
import { DomesticTasksClient } from '../services/client';
import { commandExecuter } from './command-execute';

export const runCommand = async <T extends Command>(
  client: DomesticTasksClient,
  command: T,
  arg?: string,
  isCallbackData = false
) => {
  const state = client.getCurrentState();
  const currentState = state.currentState as StatesOf<T> | 'INITIAL';
  const noAuthRequiredCommands: Command[] = ['help', 'cadastro'];

  const doer = await client.db.info.doer.get(client.userId);

  if (!noAuthRequiredCommands.includes(command) && !doer) {
    client.sendMessage('Para usar esse comando primera faca o /cadastro');
    return;
  }

  const backToLastState = (): any => {
    state.statesStack.pop();
    return state.statesStack[state.statesStack.length - 1];
  };

  const commandResolver = commandExecuter[command];

  const cleanArg = cleanString(arg);
  const originalArg = trimString(arg);

  const anyHandlerResult = await commandResolver.
    ANY?.({
      client,
      cleanArg,
      originalArg,
      isCallbackData,
      backToLastState: backToLastState as any
    });

  const commandStateResolver: CommandStateResolver<T, Exclude<typeof currentState, 'INITIAL'>> =
    // @ts-ignore
    commandResolver[currentState];

  const transitionHandle: any = currentState === 'INITIAL' ?
    commandStateResolver : commandStateResolver.transitionHandle;

  const nextState = anyHandlerResult ||
    await transitionHandle({
      client,
      cleanArg,
      originalArg,
      isCallbackData,
      backToLastState
    });

  if (nextState !== currentState) {
    if (nextState !== state.statesStack[state.statesStack.length - 1]) {
      state.statesStack.push(nextState);
    }

    await commandStateResolver.onLeave?.(client);

    // @ts-ignore eslint-ignore
    await commandStateResolver.onTransition?.[nextState]?.(client);
  }

  if (nextState === 'END') {
    await commandResolver.onEnd?.(client);
    client.resetState();
  }
  else {
    // @ts-ignore
    await commandResolver[nextState]?.onEnter?.(client);

    state.currentState = nextState;
    state.currentCommand = command;
  }
};
