interface IMessage {
  message: string;
}

export abstract class CoreValidation {
  abstract regExp: RegExp;
  abstract message: IMessage;
}
