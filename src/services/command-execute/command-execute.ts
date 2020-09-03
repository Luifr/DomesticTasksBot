import {
  criarCommand,
  cadastroCommand,
  helpCommand,
  sairCommand,
  voltarCommand
} from './commands';
import { Command, CommandStateResolver } from '../../models/command';


type ICommandExecuter = {
  [command in Command]: CommandStateResolver<command>
}

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  cadastro: cadastroCommand,
  sair: sairCommand,
  voltar: voltarCommand,
  criar: criarCommand,
};
