import { DomesticTasksClient } from '../services/client';

const commandsAndStates = {
  help: [],
  cadastro: [],
  sair: [],
  voltar: [],
  info: ['NAME'],
  feito: ['NAME'],
  editar: ['TASKS_MENU', 'EDIT_MENU'],
  tarefas: [],
  criar: ['TITLE', 'DESC', 'FREQ', 'DOER']
} as const;


export const commands = Object.keys(commandsAndStates).map(_command => _command.toLowerCase());

export type Command = keyof typeof commandsAndStates;

export type StatesOf<T extends Command> = typeof commandsAndStates[T][number];

type StateResolverFunctionReturn<T extends Command> =
  Promise<StatesOf<T> | 'END'> |
  StatesOf<T> | 'END'

type InitialFunctionResolver<T extends Command> = (
  client: DomesticTasksClient, arg?: string, originalArg?: string
) => StateResolverFunctionReturn<T>

export type StateResolverFunction<T extends Command> = (
  client: DomesticTasksClient, arg: string, originalArg: string
) => StateResolverFunctionReturn<T>

type CommandStateResolverMapper<T extends Command> = {
  [state in StatesOf<T> | 'INITIAL']: state extends 'INITIAL' ?
    InitialFunctionResolver<T> :
    StateResolverFunction<T>
}

export type CommandStateResolver<T extends Command> = StatesOf<T> extends never ?
  CommandStateResolverMapper<T> | InitialFunctionResolver<T> :
  CommandStateResolverMapper<T>

export type ICommandExecuter = {
  [command in Command]: CommandStateResolver<command>
}
