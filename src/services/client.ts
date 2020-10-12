process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { GroupController } from '../controllers/group';
import { stateMachine } from '../command/command-state-machine';
import { getGroudDbController } from './group-db';
import { getTelegramBot } from './telegram-bot';

const telegramBot= getTelegramBot();

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

interface IBotMessage {
  message?: TelegramBot.Message;
  callbackMessage?: TelegramBot.CallbackQuery;
}

interface IOtherClientOptions {
  /** The message will self destruct (dissapear) after `selfDestruct milliseconds` */
  selfDestruct?: number;
  /** User this id to send the message to other chat/user */
  chatId?: number
}

export class DomesticTasksClient {

  public userId: number;
  public chatId: number;
  public name: string;
  public arroba: string | undefined;

  protected message?: TelegramBot.Message;
  protected callbackMessage?: TelegramBot.CallbackQuery;

  public db: GroupController;

  constructor(
    { message, callbackMessage }: RequireAtLeastOne<IBotMessage>
  ) {
    this.message = message;
    this.callbackMessage = callbackMessage;

    const msg = (message || callbackMessage)!;
    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    this.arroba = msg.from!.username;
    this.chatId = (message?.chat.id || callbackMessage?.message?.chat.id)!;
    this.db = getGroudDbController(this.chatId);
  }

  private getMessageId = () => {
    if (this.message) {
      return this.message.message_id;
    }
    else {
      return this.callbackMessage!.message!.message_id;
    }
  }

  sendMessage = async (
    text: string,
    telegrmsOptions?: TelegramBot.SendMessageOptions,
    otherOptions?: IOtherClientOptions
  ) => {
    telegrmsOptions = telegrmsOptions ?? { reply_markup: { remove_keyboard: true } };
    const msg = await telegramBot.sendMessage(
      otherOptions?.chatId || this.chatId,
      text,
      telegrmsOptions
    );
    if (otherOptions?.selfDestruct) {
      setTimeout(() => {
        this.deleteMessage(msg.message_id);
      }, otherOptions.selfDestruct);
    }
    return msg;
  }


  editMessage = (text: string, options?: TelegramBot.EditMessageTextOptions) => {
    telegramBot.editMessageText(
      text,
      {
        ...{ chat_id: this.chatId, message_id: this.getMessageId() },
        ...options
      }
    ).catch(() => {
      // Mensagem nao modificada, mas esta tudo bem :)
    });
  }

  /** Delete a message, if the argument is present, that message will be deleted
   *
   * If it is not present, the last message will be deleted */
  deleteMessage = (messageId?: string | number) => {
    messageId = messageId ? String(messageId) : String(this.getMessageId());
    telegramBot.deleteMessage(this.chatId, messageId);
  }

  answerCallbackQuery = () => {
    if (!this.callbackMessage) return;
    telegramBot.answerCallbackQuery(this.callbackMessage.id);
  }

  getCurrentState = <T = any>() => {
    return stateMachine.getState<T>(this.chatId, this.userId!);
  }

}
