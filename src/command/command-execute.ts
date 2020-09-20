import {
  criarCommand,
  cadastroCommand,
  helpCommand,
  sairCommand,
  editarCommand,
  infoCommand,
  tarefasCommand,
  voltarCommand,
  feitoCommand
} from './resolvers';
import { ICommandExecuter } from '../models/command';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  cadastro: cadastroCommand,
  sair: sairCommand,
  voltar: voltarCommand,
  info: infoCommand,
  feito: feitoCommand,
  editar: editarCommand,
  tarefas: tarefasCommand,
  criar: criarCommand,
};
