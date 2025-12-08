import { CoreHttpController } from "../../core/controllers/http_controller";
import { VmValidationModel } from "./vm_validation_model";
import { Result } from "../../core/helpers/result";
export declare class VmUseCase {
    call: () => Result<undefined, undefined>;
}
export declare class VmController extends CoreHttpController<VmValidationModel> {
    constructor();
}
