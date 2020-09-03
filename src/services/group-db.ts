import { GroupController } from '../controllers/group';

const groupControllers: {[chatId: number]: GroupController} = {};

export const getGroudDbController = (chatId: number) => {
  if (!groupControllers[chatId]) {
    groupControllers[chatId] = new GroupController(chatId);
  }
  return groupControllers[chatId];
};
