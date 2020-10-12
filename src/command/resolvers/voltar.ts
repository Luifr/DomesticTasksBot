import { CommandStateResolver } from '../../models/command';

export const voltarCommand: CommandStateResolver<'voltar'> = {
  transitionHandlers: {
    INITIAL: async ({ client })=> {
      const doerController = client.db.info.doer;
      const doer = await doerController.get(client.userId);
      if (!doer) {
        client.sendMessage('Voce não esta cadastrado');
      }
      else {
        await doerController.edit(client.userId, {
          isHome: true
        });
        client.sendMessage('Voce voltou para casa\nBem vindo!');
      }
      return 'END' as const;
    }
  }
};
