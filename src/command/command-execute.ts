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
import { CommandExecuter } from '../models/command';

export const commandExecuter: CommandExecuter = {
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
