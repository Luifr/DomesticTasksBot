import { ITask } from '../models/task';


export class TaskController {

  constructor(private infoDoc: FirebaseFirestore.DocumentReference) {}

  getAll = async (): Promise<ITask[]> => {
    return (await this.infoDoc.get()).data()!.tasks as ITask[] || [];
  }

  getById = async (id: string): Promise<ITask | undefined> => {
    const tasks = await (await this.infoDoc.get()).data()!.tasks as ITask[];
    const task = tasks.find(_task => _task.id === id);
    return task;
  }

  getByName = async (name: string): Promise<ITask | undefined> => {
    const tasks = await (await this.infoDoc.get()).data()!.tasks as ITask[];
    const task = tasks.find(_task => _task.name === name);
    return task;
  }

  create = async (newTask: ITask) => {
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.name === newTask.name);
    if (taskIndex) {
      console.error('Tasks already exists');
      return;
    }
    tasks.push(newTask as ITask);
    this.infoDoc.set(
      tasks,
      { merge: true }
    );
  }

  edit = async (name: string, task: Partial<ITask>) => {
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.name === name);
    if (!taskIndex) {
      console.error('Tasks does not exist');
      return;
    }
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...task
    };
    this.infoDoc.set(
      tasks,
      { merge: true }
    );
  }
}
