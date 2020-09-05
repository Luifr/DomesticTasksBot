import { DomesticTasksBot } from '../../telegram-bot';

export const helpCommand = (bot: DomesticTasksBot, _arg?: string) => {
  const contact = process.env.DEV_CONTACT;
  const contactText = contact ?
    `Qualquer duvida ou sugestão, so chamar: ${contact}` :
    '';

  /* eslint-disable max-len */
  const helpText = 'Olar eu posso te ajudar a dividir as tarefas domesticas!\n' +
  'Comandos disponiveis:\n\n' +
  `\n${contactText}`;

  bot.sendMessage(helpText, { parse_mode: 'HTML' });
  return 'END' as const;
};
