import { DomesticTasksBot } from '../../telegram-bot';

export const sairCommand = async (bot: DomesticTasksBot, _arg?: string) => {
  const doerController = bot.db.info.doer;
  const doer = await doerController.get(bot.userId);
  if (!doer) {
    bot.sendMessage('Voce não esta cadastrado');
  }
  else {
    await doerController.edit(bot.userId, {
      isHome: false
    });
    bot.sendMessage('Voce foi saiu de casa\nAu revoir');
  }
  return 'END' as const;
};
