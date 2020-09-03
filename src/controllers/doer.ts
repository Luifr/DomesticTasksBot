import { IDoer } from '../models/doer';


export class DoerController {

  constructor(private infoDoc: FirebaseFirestore.DocumentReference) { }

  getAll = async (): Promise<IDoer[]> => {
    return (await this.infoDoc.get()).data()?.doers as IDoer[] || [];
  }

  get = async (userId: number): Promise<IDoer | undefined> => {
    const doers = await (await this.infoDoc.get()).data()?.doers as IDoer[] || [];
    const doer = doers.find(_doer => _doer.userId === userId);
    return doer;
  }

  create = async (newDoer: IDoer) => {
    const doers = await this.getAll();
    const doerIndex = doers.findIndex(doer => doer.userId === newDoer.userId);
    if (doerIndex > -1) {
      console.error('Doer already exists');
      return;
    }
    doers.push(newDoer as IDoer);
    return this.infoDoc.set(
      {
        doers
      },
      { merge: true }
    );
  }

  edit = async (userId: number, doer: Partial<IDoer>) => {
    const doers = await this.getAll();
    const doerIndex = doers.findIndex(doer => doer.userId === userId);
    if (doerIndex === -1) {
      console.error('Doer does not exist');
      return;
    }
    doers[doerIndex] = {
      ...doers[doerIndex],
      ...doer
    };
    return this.infoDoc.set(
      {
        doers
      },
      { merge: true }
    );
  }
}
