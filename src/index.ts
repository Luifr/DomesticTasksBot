import 'source-map-support/register';
import { isProd } from './helpers';
import './services/init-controllers';

// TODO: pegar o utils do approxima
// TODO: arrumar estrutura das pastas
// TODO: manager dos timeouts de reminder (conseguir acessar eles e editar de outros lugares)
// TODO: mirgar para o mongodb?
// TODO: logging/report system
// TODO: quando o dia for livre precisa agendar pra passar sozinho, fak

const missingEnv: string[] = [];

if (!process.env.CLIENT_EMAIL) {
  missingEnv.push('CLIENT_EMAIL');
}
if (!process.env.PRIVATE_KEY) {
  missingEnv.push('PRIVATE_KEY');
}
if (!process.env.PROJECT_ID) {
  missingEnv.push('PROJECT_ID');
}
if (!process.env.BOT_TOKEN) {
  missingEnv.push('BOT_TOKEN');
}
if (!process.env.BOT_USERNAME) {
  missingEnv.push('BOT_USERNAME');
}
if (!process.env.DATABASE_NAME) {
  missingEnv.push('DATABASE_NAME');
}
if (isProd) {
  // Prod env vars
  if (!process.env.HEROKU_APP) {
    missingEnv.push('HEROKU_APP');
  }
}

if (missingEnv.length > 0) {
  throw Error(`Please set the following environment variables:\n${missingEnv.join('\n')}`);
}
