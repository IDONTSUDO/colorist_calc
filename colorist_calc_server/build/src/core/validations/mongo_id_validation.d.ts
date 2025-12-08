import { CoreValidation } from "./core_validation";
export declare class MongoIdValidation extends CoreValidation {
    regExp: RegExp;
    message: {
        message: string;
    };
}
