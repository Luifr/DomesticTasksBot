
export interface ITaskToCreate {
  id?: string;
  name: string;
  originalName: string;
  description: string;
  frequency: number;
  doers: number[];
  nextDoer: number;
  nextDay: string;
}

export interface ITask {
  id: string;
  name: string;
  originalName: string;
  description: string;
  frequency: number;
  doers: number[];
  nextDoer: number;
  nextDay: string;
  lastRemindDay: string;
}
