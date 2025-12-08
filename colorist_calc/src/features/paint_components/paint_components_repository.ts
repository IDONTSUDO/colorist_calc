import { CrudHttpRepository } from "../../core/repository/http_repository";
import { PaintComponentViewModel } from "./paint_components_store";
 
export class PaintComponentsHttpRepository extends CrudHttpRepository<PaintComponentViewModel> {
    featurePath: string = '/components';
}
