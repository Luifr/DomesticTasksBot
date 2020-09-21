import { isProd } from './helpers';
import './services/init-controllers';

// TODO: ver o heroku rodar local
// TODO: pegar o utils do approxima
// TODO: arrumar estrutura das pastas
// TODO: manager dos timeouts de reminder (conseguir acessar eles e editar de outros lugares)
// TODO: mirgar para o mongodb?

if (
  !process.env.CLIENT_EMAIL ||
  !process.env.PRIVATE_KEY ||
  !process.env.PROJECT_ID ||
  !process.env.BOT_TOKEN ||
  !process.env.DATABASE_NAME ||
  (isProd && !process.env.HEROKU_APP)
) {
  throw Error('Please set environment variables!');
}
