
export interface ITask {
  id: string;
  name: string;
  description: string;
  frequency: number;
  doers: string[];
  nextDoer: string;
  nextDay: string;
}
