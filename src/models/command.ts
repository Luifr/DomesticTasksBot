import { DomesticTasksClient } from '../services/client';

const commandsAndStates = {
  help: [],
  cadastro: [],
  sair: [],
  voltar: [],
  info: ['NAME'],
  feito: ['NAME'],
  editar: ['TASKS_MENU', 'EDIT_MENU'],
  tarefas: ['MENU', 'TASK', 'DOERS', 'EDIT_DOERS'],
  criar: ['TITLE', 'DESC', 'FREQ', 'DOER']
} as const;


export const commands = Object.keys(commandsAndStates).map(_command => _command.toLowerCase());

export type Command = keyof typeof commandsAndStates;

export type StatesOf<T extends Command> = typeof commandsAndStates[T][number];

type StateEventFunction = (client: DomesticTasksClient) => void;

type StateResolverFunctionReturn<T extends Command> =
  Promise<StatesOf<T> | 'END'> |
  StatesOf<T> | 'END'

type InitialStateTransitionFunction<T extends Command> = (args: {
  client: DomesticTasksClient, cleanArg?: string, originalArg?: string
}) => StateResolverFunctionReturn<T>

type AnyTransitionFunction<T extends Command> = (arg: {
  client: DomesticTasksClient,
  cleanArg?: string,
  originalArg?: string,
  isCallbackData: boolean,
  backToLastState: () => StatesOf<T>
}) => StateResolverFunctionReturn<T> | '' | undefined

export type StateTransitionFunction<T extends Command> = (args: {
  client: DomesticTasksClient,
  cleanArg: string,
  originalArg: string,
  isCallbackData: boolean,
  backToLastState: () => StatesOf<T>
}) => StateResolverFunctionReturn<T>

export type CommandStateResolver<T extends Command, state extends StatesOf<T>> = {
  transitionHandle: StateTransitionFunction<T>;
  onLeave?: StateEventFunction;
  onEnter?: StateEventFunction;
  onTransition?: {
    [to in Exclude<StatesOf<T> | 'END', state>]?: StateEventFunction
  }
}

export type CommandStatesResolver<T extends Command> = {
  [state in StatesOf<T>]: CommandStateResolver<T, state>;
} & {
  onEnd?: StateEventFunction;
  INITIAL: InitialStateTransitionFunction<T>;
  ANY?: AnyTransitionFunction<T>;
}

export type CommandExecuter = {
  [command in Command]: CommandStatesResolver<command>
}
