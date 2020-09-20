import { parseDate } from '../../helpers/date';
import { CommandStateResolver } from '../../models/command';
import { IDoer } from '../../models/doer';
import { DomesticTasksClient } from '../../services/client';

const doTask = async (client: DomesticTasksClient, taskName: string) => {
  const task = await client.db.info.task.getByName(taskName);
  if (!task) {
    client.sendMessage('Tarefa não encontrada, use o /tarefas para ver as disponiveis');
    return;
  }
  const currentDoer = (await client.db.info.doer.get(task.doers[task.nextDoer]))!;

  let nextDoer: IDoer;
  do {
    if (++task.nextDoer >= task.doers.length) {
      task.nextDoer = 0;
    }
    nextDoer = (await client.db.info.doer.get(task.doers[task.nextDoer]))!;
  } while (!nextDoer.isHome);

  const today = new Date();
  today.setDate(today.getDate() + task.frequency);

  client.db.info.task.edit(taskName, {
    nextDoer: task.nextDoer,
    nextDay: parseDate(today)
  });

  const nextDayText = task.frequency === 1 ? 'amanhã' : `${task.frequency} dias`;

  const replyMessage = `${currentDoer.name} fez a tarefa \`${task.originalName}\`\n` +
    `O(a) proximo(a) é ${nextDoer.name} ${nextDayText}`;

  client.sendMessage(replyMessage, { parse_mode: 'Markdown' });
};

export const feitoCommand: CommandStateResolver<'feito'> = {
  INITIAL: async (client, arg) => {
    if (!arg) {
      client.sendMessage('Me mande o nome da tarefa');
      return 'NAME';
    }
    doTask(client, arg);
    return 'END';
  },
  NAME: (client, arg) => {
    doTask(client, arg);
    return 'END';
  }
};
