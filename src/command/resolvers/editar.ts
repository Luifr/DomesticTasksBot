import { CommandStateResolver } from '../../models/command';

interface IEditContext {
  name: string;
}

export const editarCommand: CommandStateResolver<'editar'> = {
  transitionHandlers: {
    INITIAL: (client, arg) => {
      if (!arg) {
        client.sendMessage('Que tarefa que voce quer editar?');
        return 'TASKS_MENU';
      }
      client.getCurrentState<IEditContext>().context.name = arg;
      return 'EDIT_MENU';
    },
    // TODO: edit
    TASKS_MENU: (_client, _arg) => {
      return 'END';
    },
    EDIT_MENU: (_client, _arg) => {
      return 'END';
    }
  }
};
