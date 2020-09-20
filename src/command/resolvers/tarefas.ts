import { CommandStateResolver } from '../../models/command';

export const tarefasCommand: CommandStateResolver<'tarefas'> = async (client, _arg) => {
  const tasks = await client.db.info.task.getAll();

  const tasksNames = tasks.map(task => task.originalName).join('\n');

  client.sendMessage(`Aqui estão as tarefas cadastradas:\n${tasksNames}`);
  return 'END' as const;
};
