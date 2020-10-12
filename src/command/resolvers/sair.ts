import { CommandStateResolver } from '../../models/command';

export const sairCommand: CommandStateResolver<'sair'> = {
  transitionHandlers: {
    INITIAL: async ({ client })=> {
      const doerController = client.db.info.doer;
      const doer = await doerController.get(client.userId);
      if (!doer) {
        client.sendMessage('Voce não esta cadastrado');
      }
      else {
        await doerController.edit(client.userId, {
          isHome: false
        });
        client.sendMessage('Voce saiu de casa\nAu revoir');
      }
      return 'END' as const;
    }
  }
};
