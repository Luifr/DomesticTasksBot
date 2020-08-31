import { normaliseString } from '../../helpers/string';
import { Command, CommandStateResolver } from '../../models/command';
import { DomesticTasksBot } from '../telegram-bot';
import { helpCommand } from './help';
import { criarCommand } from './criar';

export type ICommandExecuter = {
  [command in Command]: CommandStateResolver<command>
}

export const runCommand = async (
  bot: DomesticTasksBot,
  command: Command,
  arg?: string
) => {
  const commandExecuter: ICommandExecuter = {
    help: {
      INITIAL: helpCommand
    },
    criar: criarCommand
  };

  const state = bot.getCurrentState();
  // @ts-ignore
  const nextState = await commandExecuter[command][state.currentState](
    bot, normaliseString(arg)
  );
  if (nextState === 'END') {
    state;
  }
  else {
    state.currentState = nextState;
    state.currentCommand = command;
  }
};
