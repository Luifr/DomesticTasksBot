import { CommandStateResolver, StateResolverFunction } from '../../../models/command';
import { DomesticTasksBot } from '../../telegram-bot';

interface ICriarContext {
  title: string;
  desc: string;
  freq: number;
  doers: number[];
}

const setTitle: StateResolverFunction<'criar'> = async (
  bot: DomesticTasksBot,
  arg: string
) => {
  const { context } = bot.getCurrentState<ICriarContext>();
  const task = await bot.db.info.task.getByName(arg);
  if (task) {
    bot.sendMessage('Ja existe uma tarefa com esse nome, tente outro');
    return 'TITLE';
  }
  context.title = arg;
  bot.sendMessage(`De uma descricao para a tarefa \`${arg}\`!`);
  return 'DESC';
};

const getDoersKeyboard = async (bot: DomesticTasksBot, doersIds?: number[]) => {
  const doers = await bot.db.info.doer.getAll();
  const keyboard = doers.map(doer => {
    const isHomeEmoticon = doer.isHome ? '🏠' : '✈️';
    return [{
      text: `${isHomeEmoticon} - ${doer.nickName || doer.name}`,
      callback_data: String(doer.userId)
    }];
  });
  doersIds?.forEach((doer, index) => {
    const doerStr = String(doer);
    const doerIndex = keyboard.findIndex(key => key[0].callback_data === doerStr);
    keyboard[doerIndex][0].text += ` - ${index + 1}`;
  });
  if (doersIds && doersIds.length > 0) {
    keyboard.push([{ text: 'Desfazer', callback_data: 'pop' }]);
  }
  keyboard.push([{ text: 'Enviar', callback_data: 'enviar' }]);
  return keyboard;
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
    const { context } = bot.getCurrentState<ICriarContext>();
    context.desc = arg;
    bot.sendMessage(`A cada quantos dias?`);
    return 'FREQ';
  },
  FREQ: async (bot, arg) => {
    const freq = +arg;
    if (isNaN(freq)) {
      bot.sendMessage('Preciso de um numero, de quantos em quantos dias a tarefa se repete!');
      return 'FREQ';
    }
    const { context } = bot.getCurrentState<ICriarContext>();
    context.freq = +arg;
    context.doers = [];
    let responseText = 'Selecione os responsaveis\n';
    responseText += 'Quando acabar é só enviar';

    bot.sendMessage(responseText, {
      reply_markup: {
        inline_keyboard: await getDoersKeyboard(bot)
      }
    });
    return 'DOER';
  },
  DOER: async (bot, arg) => {
    const { context } = bot.getCurrentState<ICriarContext>();
    if (arg != 'enviar') {
      if (arg === 'pop') {
        context.doers.pop();
      }
      else {
        // TODO: check if can transform arg to number
        context.doers.push(+arg);
      }
      let responseText = 'Selecione os responsaveis\n';
      responseText += 'Quando acabar é só enviar';
      bot.editMessage(
        responseText,
        {
          reply_markup: {
            inline_keyboard: await getDoersKeyboard(bot, context.doers)
          }
        }
      );
      return 'DOER';
    }

    if (context.doers.length === 0) {
      const responseText = 'É preciso ter pelo menos uma pessoa para fazer a tarefa';
      bot.sendMessage(responseText, undefined, 3300);
      return 'DOER';
    }

    await bot.db.info.task.create({
      name: context.title,
      description: context.desc,
      doers: context.doers,
      frequency: context.freq
    });
    bot.sendMessage(`Tarefa \`${context.title}\` criado(a)`);
    return 'END';
  }
};
