import './services/telegram-bot';

const isProd = process.env.NODE_ENV === 'production';

if (
  !process.env.CLIENT_EMAIL ||
  !process.env.PRIVATE_KEY ||
  !process.env.PROJECT_ID ||
  !process.env.BOT_TOKEN ||
  !process.env.DATABASE_NAME ||
  (isProd && !process.env.HEROKU_URL)
) {
  throw Error('Please set environment variables!');
}
