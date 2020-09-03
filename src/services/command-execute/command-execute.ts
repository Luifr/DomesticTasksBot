import {
  criarCommand,
  cadastroCommand,
  helpCommand,
  sairCommand,
  voltarCommand
} from './commands';
import { ICommandExecuter } from '../../models/command';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  cadastro: cadastroCommand,
  sair: sairCommand,
  voltar: voltarCommand,
  criar: criarCommand,
};
