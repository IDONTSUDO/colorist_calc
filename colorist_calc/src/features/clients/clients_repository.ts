import { CrudHttpRepository } from "../../core/repository/http_repository";
import { ClientViewModel } from "./clients_store";

export class ClientsHttpRepository extends CrudHttpRepository<ClientViewModel> {
    featurePath: string = '/clients';
}
