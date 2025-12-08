import { CoreValidation } from "./core_validation";

export class MongoIdValidation extends CoreValidation {
  regExp = RegExp("^[0-9a-fA-F]{24}$");
  message = { message: "is do not mongo db object uuid" };
}
