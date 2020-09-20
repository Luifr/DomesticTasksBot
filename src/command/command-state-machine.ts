import { Command } from '../models/command';

interface ICommandStateMachineUserEntry<T> {
  currentState: string;
  currentCommand: Command | '';
  context: T;
}

interface ICommandStateMachineChatEntry {
  [userId: number]: ICommandStateMachineUserEntry<any>
}

interface ICommandStateMachine {
  [chatId: number]: ICommandStateMachineChatEntry;
}

class CommandStateMachine {
  private stateMachine: ICommandStateMachine = {};

  getState = <T>(chatId: number, userId: number): ICommandStateMachineUserEntry<T> => {
    if (!this.stateMachine[chatId]) {
      this.stateMachine[chatId] = {};
    }
    if (!this.stateMachine[chatId][userId]) {
      this.stateMachine[chatId][userId] = {
        context: {},
        currentCommand: '',
        currentState: 'INITIAL'
      };
    }
    return this.stateMachine[chatId][userId];
  }

  resetState = (chatId: number, userId: number) => {
    if (!this.stateMachine[chatId]) {
      this.stateMachine[chatId] = {};
    }
    this.stateMachine[chatId][userId] = {
      context: {},
      currentCommand: '',
      currentState: 'INITIAL'
    };
  }


}

export const stateMachine = new CommandStateMachine();
