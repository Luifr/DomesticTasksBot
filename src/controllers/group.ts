import { db } from '../db';
import { InfoController } from './info';


export class GroupController {

  info: InfoController;

  constructor(chatId: number) {
    const groupCollection = db.collection(String(chatId));
    const infoDoc = groupCollection.doc('info');
    this.info = new InfoController(infoDoc);
  }

}
