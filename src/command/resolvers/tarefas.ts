import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/command';
import { ITask } from '../../models/task';
import { DomesticTasksClient } from '../../services/client';

interface ITasksContext {
  tasks: ITask[];
  currentTask: ITask;
  subMenu: '' | 'doers';
  edit: boolean;
}

const sendTasksKeyboard = async (
  client: DomesticTasksClient
) => {

  const context = client.getCurrentContext<ITasksContext>();
  const tasks = context.tasks;

  let message = '';
  const tasksKeyboard: InlineKeyboardButton[][] = [];

  if (!context.currentTask) {
    message = `Aqui estão as tarefas cadastradas`;

    tasks.forEach((task) => {
      tasksKeyboard.push([{ text: task.originalName, callback_data: 'open:' + task.originalName }]);
    });

    tasksKeyboard.push([{ text: 'Criar nova tarefa ➕', callback_data: 'create' }]);
    tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);

    client.sendMessage(message, { reply_markup: { inline_keyboard: tasksKeyboard } });
    return;
  }
  else if (context.subMenu === '') {
    const currentTask = context.currentTask;
    message = `Tarefa: ${currentTask.originalName}`;
    const nextDoer = (await client.db.info.doer.get(currentTask.doers[currentTask.nextDoer]))!;

    // TODO: add butttons that can show and edit task info
    tasksKeyboard.push([{ text: `Proximo: ${nextDoer.name}`, callback_data: 'show:next' }]);
    tasksKeyboard.push([{ text: 'Deletar ❌', callback_data: 'delete' }]);
  }
  else if (context.subMenu === 'doers') {
    const doers = await client.db.info.getTaskDoers(context.currentTask);

    doers.forEach((doer, index) =>
      tasksKeyboard.push([{
        text: doer.name + (context.currentTask.nextDoer === index ? '🚩' : ''),
        callback_data: String(index)
      }])
    );

    tasksKeyboard.push([{ text: 'Editar pessoas 🖊️', callback_data: 'edit' }]);

    message = `A lista da pessoas para a tarefa ${context.currentTask.originalName}\n` +
    'Clique em alguem para que ela seja a proxima pessoa';
  }

  tasksKeyboard.push([{ text: 'Voltar ↩️', callback_data: 'back' }]);
  tasksKeyboard.push([{ text: 'Fechar menu 🚪', callback_data: 'close' }]);
  client.editMessage(message, { reply_markup: { inline_keyboard: tasksKeyboard } });
};

export const tarefasCommand: CommandStateResolver<'tarefas'> = {
  // ---
  INITIAL: async (client) => {

    const tasks = await client.db.info.task.getAll();

    const context = client.getCurrentContext<ITasksContext>();
    context.tasks = tasks;
    context.currentTask = undefined as any;
    context.subMenu = '';

    if (context.tasks.length === 0) {
      client.sendMessage(`Não ha tarefas cadastradas`);
      return 'END';
    }

    await sendTasksKeyboard(client);
    return 'MENU';
  },
  MENU: async (client, arg) => {
    // ${...tasks}
    // criar
    // fechar
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
    else if (!arg.startsWith('open:')) {
      client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
      return 'MENU';
    }

    const selectedTask = arg.substring('open:'.length);
    const context = client.getCurrentContext<ITasksContext>();
    context.currentTask = context.tasks.find(task => task.name === selectedTask)!;

    await sendTasksKeyboard(client);
    return 'TASK';

  },
  TASK: async (client, arg) => {
    const context = client.getCurrentContext<ITasksContext>();
    if (arg === 'close') {
      client.deleteMessage();
      return 'END';
    }
    else if (arg === 'back') {
      // TODO: create
      context.currentTask = undefined as any;
      sendTasksKeyboard(client);
      return 'MENU';
    }
    else if (arg === 'delete') {
      // TODO: create
      client.sendMessage('Função delete nao implementada 😅');
      client.deleteMessage();
      return 'END';
    }
    else if (!arg.startsWith('show:')) {
      client.sendMessage('Escolha uma das opções do teclado', undefined, { selfDestruct: 1200 });
      return 'TASK';
    }

    const show = arg.substring('show:'.length);

    if (show === 'next') {
      context.subMenu = 'doers';
      await sendTasksKeyboard(client);
      return 'IN_TASK';
    }
    else {
      client.sendMessage('Função edit nao implementada 😅');
      client.deleteMessage();
      return 'END';
    }

  },
  IN_TASK: async (client, arg) => {
    const context = client.getCurrentContext<ITasksContext>();

    if (arg === 'back') {
      context.subMenu = '';
      await sendTasksKeyboard(client);
      return 'TASK';
    }

    if (arg === 'close') {
      client.deleteMessage();
      return 'END';
    }

    // Check task action, depends on current task submenu
    if (context.subMenu == 'doers') {
      // TODO: easier flow with keyboard
      if (context.currentTask.nextDoer !== +arg) {
        context.currentTask.nextDoer = +arg;
        client.db.info.task.edit(
          context.currentTask.name,
          { nextDoer: +arg }
        );
        await sendTasksKeyboard(client);
      }
      return 'IN_TASK';
    }

    // TODO: error if not in any cases
    return 'END';
  }
};
