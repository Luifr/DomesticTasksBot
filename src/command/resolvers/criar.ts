import { getTodayString } from '../../helpers/date';
import { CommandStateResolver, StateTransitionFunction } from '../../models/command';
import { DomesticTasksClient } from '../../services/client';

interface ICriarContext {
  title: string;
  originalTitle: string;
  desc: string;
  freq: number;
  doers: number[];
}

const setTitle: StateTransitionFunction<'criar'> = async ({ client, cleanArg, originalArg }) => {
  const { context } = client.getCurrentState<ICriarContext>();
  const task = await client.db.info.task.getByName(cleanArg);
  if (task) {
    client.sendMessage('Ja existe uma tarefa com esse nome, tente outro');
    return 'TITLE';
  }
  context.title = cleanArg;
  context.originalTitle = originalArg;
  const replyText = `De uma descricao para a tarefa \`${originalArg}\`!`;
  client.sendMessage(replyText, { parse_mode: 'Markdown' });
  return 'DESC';
};

const getDoersKeyboard = async (client: DomesticTasksClient, doersIds?: number[]) => {
  const doers = await client.db.info.doer.getAll();
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
  transitionHandlers: {
    INITIAL: ({ client, cleanArg, originalArg }) => {
      if (!cleanArg) {
        client.sendMessage(`Qual o nome da tarefa?`);
        return 'TITLE';
      }
      return setTitle({ client, cleanArg, originalArg: originalArg!, isCallbackData: false });
    },
    TITLE: setTitle,
    DESC: ({ client, cleanArg }) => {
      const { context } = client.getCurrentState<ICriarContext>();
      context.desc = cleanArg;
      client.sendMessage(`A cada quantos dias?`);
      return 'FREQ';
    },
    FREQ: async ({ client, cleanArg }) => {
      const freq = +cleanArg;
      if (isNaN(freq)) {
        client.sendMessage('Preciso de um numero, de quantos em quantos dias a tarefa se repete!');
        return 'FREQ';
      }
      const { context } = client.getCurrentState<ICriarContext>();
      context.freq = +cleanArg;
      context.doers = [];
      let responseText = 'Selecione os responsaveis\n';
      responseText += 'Quando acabar é só enviar';

      client.sendMessage(responseText, {
        reply_markup: {
          inline_keyboard: await getDoersKeyboard(client)
        }
      });
      return 'DOER';
    },
    DOER: async ({ client, cleanArg }) => {
      const { context } = client.getCurrentState<ICriarContext>();
      if (cleanArg != 'enviar') {
        if (cleanArg ==='pop') {
          context.doers.pop();
        }
        else {
          // TODO: check if can transform arg to number
          context.doers.push(+cleanArg);
        }
        let responseText = 'Selecione os responsaveis\n';
        responseText += 'Quando acabar é só enviar';
        client.editMessage(
          responseText,
          {
            reply_markup: {
              inline_keyboard: await getDoersKeyboard(client, context.doers)
            }
          }
        );
        return 'DOER';
      }

      if (context.doers.length === 0) {
        const responseText = 'É preciso ter pelo menos uma pessoa para fazer a tarefa';
        client.sendMessage(responseText, undefined, { selfDestruct: 3300 });
        return 'DOER';
      }

      await client.db.info.task.create({
        name: context.title,
        originalName: context.originalTitle,
        description: context.desc,
        doers: context.doers,
        frequency: context.freq,
        nextDay: getTodayString(),
        nextDoer: Math.floor(Math.random() * context.doers.length)
      });
      client.sendMessage(`Tarefa \`${context.title}\` criado(a)`, { parse_mode: 'Markdown' });
      return 'END';
    }
  }
};
