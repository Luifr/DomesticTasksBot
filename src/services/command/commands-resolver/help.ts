import { DomesticTasksBot } from '../../telegram-bot';

export const helpCommand = (bot: DomesticTasksBot, _arg?: string) => {
  const contact = process.env.DEV_CONTACT;
  const contactText = contact ?
    `Qualquer duvida ou sugestão, so chamar: ${contact}` :
    '';
  /* eslint-disable max-len */
  bot.sendMessage(
    'Olar eu posso te ajudar a dividir as tarefas domesticas!\n' +
    'Comandos disponiveis:\n\n' +
    `\n${contactText}`
  );
  return 'END' as const;
};
