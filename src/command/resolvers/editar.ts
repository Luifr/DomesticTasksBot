import { CommandStatesResolver } from '../../models/command';

interface IEditContext {
  name: string;
}

export const editarCommand: CommandStatesResolver<'editar'> = {
  INITIAL: ({ client, cleanArg }) => {
    if (!cleanArg) {
      client.sendMessage('Que tarefa que voce quer editar?');
      return 'TASKS_MENU';
    }
    client.getCurrentState<IEditContext>().context.name = cleanArg;
    return 'EDIT_MENU';
  },
  // TODO: edit
  TASKS_MENU: {
    transitionHandle: () => {
      return 'END';
    }
  },
  EDIT_MENU: {
    transitionHandle: () => {
      return 'END';
    }
  }
};
