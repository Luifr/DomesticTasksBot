import { DomesticTasksBot } from '../services/telegram-bot';

const commandsAndStates = {
  help: [],
  criar: ['TITLE', 'DESC', 'FREQ']
} as const;


export const commands = Object.keys(commandsAndStates);

export type Command = keyof typeof commandsAndStates;

export type StatesOf<T extends Command> = typeof commandsAndStates[T][number];

export type CommandStateResolver<T extends Command> = {
  [state in StatesOf<T> | 'INITIAL']:
  (bot: DomesticTasksBot, arg: string) =>
    Promise<StatesOf<T> | 'END'> |
    StatesOf<T> | 'END'
}
