import { TaskController } from './task';
import { DoerController } from './doer';


export class InfoController {

  task: TaskController;
  doer: DoerController;

  constructor(infoDoc: FirebaseFirestore.DocumentReference) {
    const infoDocProxy = new Proxy(infoDoc, {
      get: (infoDoc, prop) => {
        if (prop === 'set') {
          return (object: any, ...args: any[]) => infoDoc.set(
            JSON.parse(JSON.stringify(object)), ...args
          );
        }
        // @ts-ignore
        return infoDoc[prop];
      }
    });
    this.task = new TaskController(infoDocProxy);
    this.doer = new DoerController(infoDocProxy);
  }

}
