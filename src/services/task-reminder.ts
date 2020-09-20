import { msInADay, parseDate } from '../helpers/date';
import { getAllGroudDbControllers } from './group-db';
import { getTelegramBot } from './telegram-bot';

// Day format: YYYY-MM-DD

const getReminderInfo = (nextDate: number): [number, string] => {
  const diff = nextDate - Date.now();
  if (diff > 0) {
    return [diff, 'Lembrete para tarefa:'];
  }
  else {
    if (msInADay + diff > 0) {
      return [0, 'Lembrete para tarefa:'];
    }
    else {
      return [0, 'Lembrete de tarefa atrasada:'];
    }
  }
};

// TODO: so lembrar se estiver em prod
export const initReminders = async () => {
  const telegramBot = getTelegramBot();
  const groups = await getAllGroudDbControllers();
  Object.entries(groups).forEach(async ([chatId, group]) => {
    const tasks = await group.info.task.getAll();
    tasks.forEach(async task => {
      // TODO: default remind time for each group and for each task
      const remindHour = 11;
      const today = new Date(`${task.nextDay}T${remindHour}:00:00`).getTime();
      const [ms, headerText] = getReminderInfo(today);

      const doerId = task.doers[task.nextDoer];
      const doer = await group.info.doer.get(doerId);
      // TODO: check if doer is home
      const remindBody = `\`${task.originalName}\`\n` +
        `Hoje é a vez do(a) \`${doer?.name}\``;
      const nextRemindText = `${headerText} ${remindBody}`;

      setTimeout(() => {
        telegramBot.sendMessage(chatId, nextRemindText, { parse_mode: 'Markdown' });
        // TODO: check last day that is was done to know next day to remerber
        // TODO: get interval and timeout id to reset it in case of an edit
        // TODO: start timeout when creating a task
        const today = new Date();
        const todayHour = today.getHours();
        if (todayHour > 11) {
          today.setDate(today.getDate()+1);
        }
        const nextRemindDate = new Date(`${parseDate(today)}T${remindHour}:00:00`).getTime();
        const remindInterval = task.frequency * msInADay;
        const timeoutToFirstInterval = ms > 0 ? 0 : nextRemindDate - new Date().getTime();
        setTimeout(() => {
          setInterval(() => {
            const intervalRemindText = `Lembrete para tarefa: ${remindBody}`;
            telegramBot.sendMessage(chatId, intervalRemindText, { parse_mode: 'Markdown' });
          }, remindInterval);
        }, timeoutToFirstInterval);
      }, ms);

    });
  });
};
