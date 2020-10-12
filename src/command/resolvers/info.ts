import { getDaysFromDiff, getHoursFromDiff } from '../../helpers/date';
import { CommandStateResolver } from '../../models/command';
import { DomesticTasksClient } from '../../services/client';

const showTaskInfo = async (client: DomesticTasksClient, taskName: string) => {
  const task = await client.db.info.task.getByName(taskName);
  if (!task) {
    client.sendMessage('Tarefa não encontrada, use o /tarefas para ver as disponiveis');
    return;
  }
  const remindHour = 11; // TODO: get default remind hour
  let doersText = '';
  for (let index = 0; index < task.doers.length; index++) {
    const doer = (await client.db.info.doer.get(task.doers[index]))!;
    const isHomeEmoticon = doer.isHome ? '🏠' : '✈️';
    let currentDoerText = '';
    if (index == task.nextDoer) {
      currentDoerText = `🚩`;
      const timeDiff = new Date(`${task.nextDay}T${remindHour}:00:00`).getTime() - Date.now();
      const hours = getHoursFromDiff(timeDiff, 0);
      const days = getDaysFromDiff(timeDiff, 0);
      if (timeDiff < 0) {
        currentDoerText += ' (hoje)';
      }
      else if (hours < remindHour || days < 2) {
        currentDoerText += ' (amanhã)';
      }
      else {
        currentDoerText += ` (em ${days} dias)`;
      }
    }
    doersText += `${isHomeEmoticon} - ${doer.name} ${currentDoerText}\n`;
  }

  const taskInfo = `${task.originalName}\n` +
    `${doersText}`;

  client.sendMessage(taskInfo);
};

export const infoCommand: CommandStateResolver<'info'> = {
  transitionHandlers: {
    INITIAL: async (client, arg) => {
      if (!arg) {
        client.sendMessage('Me mande o nome da tarefa');
        return 'NAME';
      }
      showTaskInfo(client, arg);
      return 'END';
    },
    NAME: (client, arg) => {
      showTaskInfo(client, arg);
      return 'END';
    }
  }
};
