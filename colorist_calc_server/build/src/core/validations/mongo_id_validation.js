import { CoreValidation } from "./core_validation";
export class MongoIdValidation extends CoreValidation {
    constructor() {
        super(...arguments);
        this.regExp = RegExp("^[0-9a-fA-F]{24}$");
        this.message = { message: "is do not mongo db object uuid" };
    }
}
