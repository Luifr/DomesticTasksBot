import { CommandStateResolver } from '../../models/command';

interface IEditContext {
  name: string;
}

export const editarCommand: CommandStateResolver<'editar'> = {
  transitionHandlers: {
    INITIAL: ({ client, cleanArg }) => {
      if (!cleanArg) {
        client.sendMessage('Que tarefa que voce quer editar?');
        return 'TASKS_MENU';
      }
      client.getCurrentState<IEditContext>().context.name = cleanArg;
      return 'EDIT_MENU';
    },
    // TODO: edit
    TASKS_MENU: () => {
      return 'END';
    },
    EDIT_MENU: () => {
      return 'END';
    }
  }
};
