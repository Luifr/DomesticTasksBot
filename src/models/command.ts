import { DomesticTasksBot } from '../services/telegram-bot';

const commandsAndStates = {
  help: [],
  cadastro: [],
  sair: [],
  voltar: [],
  criar: ['TITLE', 'DESC', 'FREQ', 'DOER']
} as const;


export const commands = Object.keys(commandsAndStates).map(_command => _command.toLowerCase());

export type Command = keyof typeof commandsAndStates;

export type StatesOf<T extends Command> = typeof commandsAndStates[T][number];

type StateResolverFunctionReturn<T extends Command> =
  Promise<StatesOf<T> | 'END'> |
  StatesOf<T> | 'END'

type InitialFunctionResolver<T extends Command> =
  (bot: DomesticTasksBot, arg?: string) => StateResolverFunctionReturn<T>

export type StateResolverFunction<T extends Command> =
  (bot: DomesticTasksBot, arg: string) => StateResolverFunctionReturn<T>

type CommandStateResolverMapper<T extends Command> = {
  [state in StatesOf<T> | 'INITIAL']: state extends 'INITIAL' ?
    InitialFunctionResolver<T> :
    StateResolverFunction<T>
}

export type CommandStateResolver<T extends Command> = StatesOf<T> extends never ?
  CommandStateResolverMapper<T> | StateResolverFunction<T> :
  CommandStateResolverMapper<T>
