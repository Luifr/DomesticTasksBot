import { GroupController } from '../controllers/group';
import { db } from './db';

const groupControllers: {[chatId: number]: GroupController} = {};

export const getAllGroudDbControllers = async () => {
  const groups = await db.listCollections();
  groups.forEach(group => getGroudDbController(+group.id));
  return groupControllers;
};

export const getGroudDbController = (chatId: number) => {
  if (!groupControllers[chatId]) {
    groupControllers[chatId] = new GroupController(chatId);
  }
  return groupControllers[chatId];
};
