import { CommandStateResolver } from '../../models/command';

export const cadastroCommand: CommandStateResolver<'cadastro'> = {
  transitionHandlers: {
    INITIAL: async (client, _arg) => {
      const doerController = client.db.info.doer;
      const doer = await doerController.get(client.userId);
      if (doer) {
        client.sendMessage('Voce ja esta cadastrado');
      }
      else {
        await doerController.create({
          userId: client.userId,
          name: client.name,
          arroba: client.arroba,
          isHome: true
        });
        client.sendMessage('Voce foi cadastrado');
      }
      return 'END' as const;
    }
  }
};
