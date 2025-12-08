import { CrudHttpRepository } from "../../core/repository/http_repository";
import { ConsumablesViewModel } from "./consumables_store";

export class ConsumablesHttpRepository extends CrudHttpRepository<ConsumablesViewModel> {
    featurePath: string = '/consumables';
}
