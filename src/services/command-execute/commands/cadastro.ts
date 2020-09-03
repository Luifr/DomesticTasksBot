import { DomesticTasksBot } from '../../telegram-bot';

export const cadastroCommand = async (bot: DomesticTasksBot, _arg?: string) => {
  const doerController = bot.db.info.doer;
  const doer = await doerController.get(bot.userId);
  if (doer) {
    bot.sendMessage('Voce ja esta cadastrado');
  }
  else {
    await doerController.create({
      userId: bot.userId,
      name: bot.name,
      arroba: bot.arroba,
      isHome: true
    });
    bot.sendMessage('Voce foi cadastrado');
  }
  return 'END' as const;
};
