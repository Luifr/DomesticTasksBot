import { isProd } from './helpers';
import './services/init-controllers';

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
