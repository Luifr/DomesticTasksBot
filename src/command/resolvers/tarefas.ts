import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/command';
import { ITask } from '../../models/task';
import { DomesticTasksClient } from '../../services/client';

enum TasksCallBack {
  VOLTAR = 'back',
  FECHAR = 'close'
}

interface ITasksContext {
  tasks: ITask[];
  currentTask: ITask;
  edit: boolean;
  messageId: number;
  editDoersIndexes: number[];
}

const getDoersKeyboard = async (client: DomesticTasksClient, doersIds?: number[]) => {
  const doers = await client.db.info.doer.getAll();
  const keyboard = doers.map(doer => {
    const isHomeEmoticon = doer.isHome ? '🏠' : '✈️';
    return [{
      text: `${isHomeEmoticon} - ${doer.nickName || doer.name}`,
      callback_data: String(doer.userId)
    }];
  });

  keyboard.push([{ text: 'Dia livre', callback_data: '-1' }]);

  doersIds?.forEach((doer, index) => {
    const doerStr = String(doer);
    const doerIndex = keyboard.findIndex(key => key[0].callback_data === doerStr);
    keyboard[doerIndex][0].text += ` - ${index + 1}`;
  });

  if (doersIds && doersIds.length > 0) {
    keyboard.push([{ text: 'Desfazer', callback_data: 'pop' }]);
  }
  keyboard.push([{ text: 'Salvar', callback_data: 'save' }]);
  keyboard.push([{ text: 'Cancelar', callback_data: 'cancel' }]);
  return keyboard;
};

const sendTasksKeyboard = (
  client: DomesticTasksClient, message: string,
  tasksKeyboard: InlineKeyboardButton[][]
) => {
  const { context } = client.getCurrentState<ITasksContext>();

  tasksKeyboard.push([{ text: 'Voltar ↩️', callback_data: TasksCallBack.VOLTAR }]);
  tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: TasksCallBack.FECHAR }]);
  client.editMessage(
    message,
    { reply_markup: { inline_keyboard: tasksKeyboard }, message_id: context.messageId }
  );
};

export const tarefasCommand: CommandStateResolver<'tarefas'> = {
  eventCallbacks: {
    onEnd: (client) => {
      const { context } = client.getCurrentState<ITasksContext>();
      client.deleteMessage(context.messageId);
    },
    MENU: {
      onEnter: async (client) => {
        const { context } = client.getCurrentState<ITasksContext>();
        context.currentTask = undefined as any;
        const tasks = context.tasks;

        let message = '';
        const tasksKeyboard: InlineKeyboardButton[][] = [];

        message = `Aqui estão as tarefas cadastradas`;

        tasks.forEach((task) => {
          tasksKeyboard.push([{
            text: task.originalName,
            callback_data: 'open:' + task.originalName
          }]);
        });

        if (tasksKeyboard.length === 0) {
          message = 'Voce não tem tarefas cadastradas, crie uma agora!';
        }

        tasksKeyboard.push([{ text: 'Criar nova tarefa ➕', callback_data: 'create' }]);
        tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: TasksCallBack.FECHAR }]);
        if (!context.messageId) {
          const messageResponse = await client.sendMessage(
            message,
            { reply_markup: { inline_keyboard: tasksKeyboard } }
          );
          context.messageId = messageResponse.message_id;
        }
        else {
          client.editMessage(
            message,
            { reply_markup: { inline_keyboard: tasksKeyboard }, message_id: context.messageId }
          );
        }
      }
    },
    TASK: {
      onEnter: async (client) => {
        const { context } = client.getCurrentState<ITasksContext>();
        const currentTask = context.currentTask;
        const message = `Tarefa: ${currentTask.originalName}`;

        const tasksKeyboard: InlineKeyboardButton[][] = [];

        // TODO: add butttons that can show and edit task info
        tasksKeyboard.push([{ text: `Fazedores`, callback_data: 'show:doers' }]);
        tasksKeyboard.push([{ text: 'Deletar ❌', callback_data: 'delete' }]);

        sendTasksKeyboard(client, message, tasksKeyboard);
      }
    },
    DOERS: {
      onEnter: async (client) => {
        const { context } = client.getCurrentState<ITasksContext>();
        const doers = await client.db.info.getTaskDoers(context.currentTask);
        context.editDoersIndexes = doers.map(doer => doer?.userId || -1);
        const tasksKeyboard: InlineKeyboardButton[][] = [];

        doers.forEach((doer, index) => {
          let name = 'Dia livre';
          if (doer) {
            name = doer.name;
          }
          tasksKeyboard.push([{
            text: name + (context.currentTask.nextDoer === index ? ' 🚩' : ''),
            callback_data: String(index)
          }]);
        });


        tasksKeyboard.push([{ text: '=========', callback_data: 'noop' }]);
        tasksKeyboard.push([{ text: 'Editar pessoas 🖊️', callback_data: 'edit' }]);

        const message = `A lista da pessoas para a tarefa ${context.currentTask.originalName}\n` +
          'Clique em alguem para que ela seja a proxima pessoa\n' +
          'A proxima pessoa esta marcada com a bandeira';

        sendTasksKeyboard(client, message, tasksKeyboard);
      }
    },
    EDIT_DOERS: {
      onEnter: async (client) => {
        const { context } = client.getCurrentState<ITasksContext>();
        const responseText = 'Selecione os responsaveis\n' +
          'Quando acabar é só salvar';
        client.editMessage(
          responseText,
          {
            reply_markup: {
              inline_keyboard: await getDoersKeyboard(client, context.editDoersIndexes)
            }
          }
        );
      }
    }
  },
  transitionHandlers: {
    ANY: ({ cleanArg, backToLastState }) => {
      if (cleanArg === TasksCallBack.FECHAR) {
        return 'END';
      }
      else if (cleanArg === TasksCallBack.VOLTAR) {
        return backToLastState();
      }
      return;
    },
    INITIAL: async ({ client }) => {

      const tasks = await client.db.info.task.getAll();

      const { context } = client.getCurrentState<ITasksContext>();
      context.tasks = tasks;
      context.currentTask = undefined as any;

      return 'MENU' as const;
    },
    MENU: async ({ client, cleanArg }) => {
      // ${...tasks}
      // criar
      // fechar
      if (cleanArg === 'create') {
        // TODO: create
        client.sendMessage('Função create nao implementada 😅');
        return 'END';
      }
      else if (!cleanArg.startsWith('open:')) {
        client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
        return 'MENU';
      }

      const selectedTask = cleanArg.substring('open:'.length);
      const { context } = client.getCurrentState<ITasksContext>();
      context.currentTask = context.tasks.find(task => task.name === selectedTask)!;

      return 'TASK';

    },
    TASK: async ({ client, cleanArg }) => {
      if (cleanArg === 'delete') {
        // TODO: create
        client.sendMessage('Função delete nao implementada 😅');
        return 'END';
      }
      else if (!cleanArg.startsWith('show:')) {
        client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
        return 'TASK';
      }

      const show = cleanArg.substring('show:'.length);

      if (show === 'doers') {
        return 'DOERS';
      }
      else {
        client.sendMessage('Função edit nao implementada 😅');
        return 'END';
      }

    },
    DOERS: async ({ client, cleanArg }) => {
      const { context } = client.getCurrentState<ITasksContext>();

      if (cleanArg === 'noop') {
        return 'DOERS';
      }

      const doerIndex = +cleanArg;
      if (!isNaN(doerIndex)) {
        if (context.currentTask.nextDoer !== doerIndex) {
          context.currentTask.nextDoer = doerIndex;
          client.db.info.task.edit(
            context.currentTask.name,
            { nextDoer: doerIndex }
          );
        }
      }
      else if (cleanArg === 'edit') {
        return 'EDIT_DOERS';
      }
      else {
        client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
      }

      return 'DOERS';
    },
    EDIT_DOERS: async ({ client, cleanArg, isCallbackData, backToLastState }) => {

      if (!isCallbackData) {
        client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
        return 'EDIT_DOERS';
      }

      const { context } = client.getCurrentState<ITasksContext>();

      if (cleanArg === 'save') {
        if (context.editDoersIndexes.length === 0) {
          const responseText = 'É preciso ter pelo menos uma pessoa';
          client.sendMessage(responseText, undefined, { selfDestruct: 3300 });
          return 'EDIT_DOERS';
        }
        context.currentTask.doers = context.editDoersIndexes;
        await client.db.info.task.edit(context.currentTask.name, {
          doers: context.editDoersIndexes
        });
        client.sendMessage('Ordem nova salva!', undefined, { selfDestruct: 3300 });
        return backToLastState();
      }
      else if (cleanArg === 'cancel') {
        return backToLastState();
      }

      if (cleanArg === 'pop') {
        context.editDoersIndexes.pop();
      }
      else {
        // TODO: check if can transform arg to number
        context.editDoersIndexes.push(+cleanArg);
      }
      return 'EDIT_DOERS' as const;
    }
  }
};
