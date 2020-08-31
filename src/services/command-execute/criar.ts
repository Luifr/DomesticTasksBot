import { CommandStateResolver, StatesOf } from '../../models/command';
import { DomesticTasksBot } from '../telegram-bot';

interface ICriarContext {
  title: string;
  desc: string;
  freq: number;
}

const setTitle = (bot: DomesticTasksBot, arg: string): StatesOf<'criar'> => {
  const state = bot.getCurrentState<ICriarContext>();
  state.context.title = arg;
  bot.sendMessage(`De uma descricao para a tarefa \`${arg}\`!`);
  return 'DESC';
};

export const criarCommand: CommandStateResolver<'criar'> = {
  INITIAL: (bot, arg) => {
    if (!arg) {
      bot.sendMessage(`Qual o nome da tarefa?`);
      return 'TITLE';
    }
    return setTitle(bot, arg);
  },
  TITLE: setTitle,
  DESC: (bot, arg) => {
    const state = bot.getCurrentState<ICriarContext>();
    state.context.desc = arg;
    bot.sendMessage(`A cada quantos dias?`);
    return 'FREQ';
  },
  FREQ: (bot, arg) => {
    const freq = +arg;
    if (isNaN(freq)) {
      bot.sendMessage('Preciso de um numero, de quantos em quantos dias a tarefa se repete!');
      return 'FREQ';
    }
    const state = bot.getCurrentState<ICriarContext>();
    state.context.freq = +arg;
    bot.sendMessage(`Evento salvo!`);
    return 'END';
  }
};
