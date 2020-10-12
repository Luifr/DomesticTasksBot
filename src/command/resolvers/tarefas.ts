import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/command';
import { ITask } from '../../models/task';
import { DomesticTasksClient } from '../../services/client';

interface ITasksContext {
  tasks: ITask[];
  currentTask: ITask;
  edit: boolean;
  messageId: number;
}

const sendTasksKeyboard = (
  client: DomesticTasksClient, message: string,
  tasksKeyboard: InlineKeyboardButton[][]
) => {
  const { context } = client.getCurrentState<ITasksContext>();

  tasksKeyboard.push([{ text: 'Voltar ↩️', callback_data: 'back' }]);
  tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);
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
        tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);
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
        // const nextDoer = (await client.db.info.doer.get(currentTask.doers[currentTask.nextDoer]))!;

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

        const tasksKeyboard: InlineKeyboardButton[][] = [];

        doers.forEach((doer, index) =>
          tasksKeyboard.push([{
            text: doer.name + (context.currentTask.nextDoer === index ? '🚩' : ''),
            callback_data: String(index)
          }])
        );


        tasksKeyboard.push([{ text: '=========', callback_data: 'noop' }]);
        tasksKeyboard.push([{ text: 'Editar pessoas 🖊️', callback_data: 'edit' }]);

        const message = `A lista da pessoas para a tarefa ${context.currentTask.originalName}\n` +
          'Clique em alguem para que ela seja a proxima pessoa\n' +
          'A proxima pessoa esta marcada com a bandeira';

        sendTasksKeyboard(client, message, tasksKeyboard);
      }
    }
  },
  transitionHandlers: {
    ANY: ({ client, cleanArg }) => {
      const state = client.getCurrentState();
      if (cleanArg ==='close') {
        return 'END';
      }
      else if (cleanArg ==='back') {
        state.statesStack.pop();
        return state.statesStack[state.statesStack.length - 1] as any;
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
      if (cleanArg ==='create') {
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
      // if (cleanArg ==='back') {
      //   // TODO: create
      //   return 'MENU';
      // }
      if (cleanArg ==='delete') {
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
      // if (cleanArg ==='back') {
      //   return 'TASK';
      // }

      // TODO: check if arg is valid
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
      else if (cleanArg ==='edit') {
        client.sendMessage('Função edit nao implementada 😅');
        return 'EDIT_DOERS';
      }
      else {
        client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
        return 'DOERS';
      }

      return 'DOERS';
    },
    EDIT_DOERS: () => {
      return 'EDIT_DOERS';
    }
  }
};
