import { Result } from "../helpers/result";
import { TypedEvent } from "../helpers/typed_event";
export interface IPrivateSocketData {
  userId: number;
}
export class PrivateSocketSubscriber<T extends IPrivateSocketData> {
  emitter: TypedEvent<T>;
  event: string;
  userId: number;
  constructor(emitter: TypedEvent<T>, event: string) {
    this.emitter = emitter;
    this.event = event;
  }
}
