import { ITask, ITaskToCreate } from '../models/task';
import * as uuid from 'uuid';
import { parseDate } from '../helpers/date';

export class TaskController {

  constructor(private infoDoc: FirebaseFirestore.DocumentReference) { }

  getAll = async (): Promise<ITask[]> => {
    return (await this.infoDoc.get()).data()?.tasks as ITask[] || [];
  }

  getById = async (id: string): Promise<ITask | undefined> => {
    const tasks = await (await this.infoDoc.get()).data()?.tasks as ITask[] || [];
    const task = tasks.find(_task => _task.id === id);
    return task;
  }

  getByName = async (name: string): Promise<ITask | undefined> => {
    const tasks = await (await this.infoDoc.get()).data()?.tasks as ITask[] || [];
    const task = tasks.find(_task => _task.name === name);
    return task;
  }

  create = async (newTask: ITaskToCreate) => {
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.name === newTask.name);
    if (taskIndex > -1) {
      console.error('Task already exists');
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() -1);

    const dbTask: ITask = {
      ...newTask,
      id: newTask.id ?? uuid.v4(),
      lastRemindDay: parseDate(yesterday)
    };

    tasks.push(newTask as ITask);
    return this.infoDoc.set(
      {
        task: dbTask
      },
      { merge: true }
    );
  }

  edit = async (name: string, task: Partial<ITask>) => {
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.name === name);
    if (taskIndex === -1) {
      console.error('Task does not exist');
      return;
    }
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...task
    };
    return this.infoDoc.set(
      {
        tasks,
      },
      { merge: true }
    );
  }
}
