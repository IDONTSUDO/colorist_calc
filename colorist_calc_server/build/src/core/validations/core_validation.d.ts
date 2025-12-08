interface IMessage {
    message: string;
}
export declare abstract class CoreValidation {
    abstract regExp: RegExp;
    abstract message: IMessage;
}
export {};
