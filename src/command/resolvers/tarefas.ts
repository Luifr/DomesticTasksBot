import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/command';
import { ITask } from '../../models/task';
import { DomesticTasksClient } from '../../services/client';

interface ITasksContext {
  tasks: ITask[];
  selectedTask: string;
}

const buildTasksKeyboard = (
  client: DomesticTasksClient
): InlineKeyboardButton[][] => {

  const context = client.getCurrentContext<ITasksContext>();
  const tasks = context.tasks;

  const tasksKeybaord: InlineKeyboardButton[][] = [];

  if (context.selectedTask === '') {
    tasks.forEach((task) => {
      tasksKeybaord.push([{ text: task.originalName, callback_data: 'open' + task.originalName }]);
    });

    tasksKeybaord.push([{ text: 'Criar nova tarefa ➕', callback_data: 'create' }]);
    tasksKeybaord.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);
  }
  else {
    tasksKeybaord.push([{ text: 'Editar 🖊️', callback_data: 'edit' }]);
    tasksKeybaord.push([{ text: 'Deletar ❌', callback_data: 'delete' }]);
    tasksKeybaord.push([{ text: 'Volta para lista de tarefas ↩️', callback_data: 'back' }]);
    tasksKeybaord.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);
  }

  return tasksKeybaord;
};

export const tarefasCommand: CommandStateResolver<'tarefas'> = {
  INITIAL: async (client) => {

    const tasks = await client.db.info.task.getAll();
    const context = client.getCurrentContext<ITasksContext>();
    context.selectedTask = '';
    context.tasks = tasks;

    const tasksKeyboard = buildTasksKeyboard(client);

    if (tasksKeyboard.length > 0) {
      client.sendMessage(`Aqui estão as tarefas cadastradas`, {
        reply_markup: { inline_keyboard: tasksKeyboard }
      });
      return 'MENU';
    }
    else {
      client.sendMessage(`Não ha tarefas cadastradas`);
      return 'END';
    }
  },
  MENU: (client, arg) => {
    if (arg === 'close') {
      client.deleteMessage();
      return 'END';
    }
    else if (arg === 'create') {
      // TODO: create
      client.sendMessage('Função create nao implementada 😅');
      client.deleteMessage();
      return 'END';
    }
    else if (!arg.startsWith('open')) {
      client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
      return 'MENU';
    }

    const selectedTask = arg.substring('open'.length);
    const context = client.getCurrentContext<ITasksContext>();
    context.selectedTask = selectedTask;

    const taskKeyboard = buildTasksKeyboard(client);
    const currentTask = context.tasks.find(task => task.name === selectedTask);

    client.editMessage(`${currentTask!.originalName}`, {
      reply_markup: { inline_keyboard: taskKeyboard }
    });
    return 'TASK';

  },
  TASK: (client, arg) => {
    const context = client.getCurrentContext<ITasksContext>();
    if (arg === 'close') {
      client.deleteMessage();
      return 'END';
    }
    else if (arg === 'back') {
      // TODO: create
      context.selectedTask = '';
      client.editMessage(`Aqui estão as tarefas cadastradas`, {
        reply_markup: { inline_keyboard: buildTasksKeyboard(client) }
      });
      return 'MENU';
    }
    else if (arg === 'delete') {
      // TODO: create
      client.sendMessage('Função delete nao implementada 😅');
      client.deleteMessage();
      return 'END';
    }
    else if (arg !== 'edit') {
      client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
      return 'TASK';
    }

    client.sendMessage('Função edit nao implementada 😅');
    client.deleteMessage();
    return 'END';
  }
};
