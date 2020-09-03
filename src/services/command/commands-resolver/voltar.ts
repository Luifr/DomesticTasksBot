import { DomesticTasksBot } from '../../telegram-bot';

export const voltarCommand = async (bot: DomesticTasksBot, _arg?: string) => {
  const doerController = bot.db.info.doer;
  const doer = await doerController.get(bot.userId);
  if (!doer) {
    bot.sendMessage('Voce não esta cadastrado');
  }
  else {
    await doerController.edit(bot.userId, {
      isHome: true
    });
    bot.sendMessage('Voce voltou para casa\nBem vindo!');
  }
  return 'END' as const;
};
