import { TaskController } from './task';
import { DoerController } from './doer';
import { ITask } from '../models/task';
import { IDoer } from '../models/doer';


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

  async getTaskDoers(task: ITask | number[] | string): Promise<(IDoer | undefined)[]> {
    const doersIds: number[] = [];
    if (typeof task === 'string') {
      const dbTask = await this.task.getByName(task);
      if (!dbTask) {
        console.error('Task not found');
        return [];
      }
      doersIds.push(...dbTask.doers);
    }
    else if (Array.isArray(task)) {
      doersIds.push(...task);
    }
    else if (task.doers) {
      doersIds.push(...task.doers);
    }

    return Promise.all(doersIds.map(doerId => {
      if (doerId === -1) {
        return undefined;
      }
      return this.doer.get(doerId) as Promise<IDoer>;
    }));
  }

}
