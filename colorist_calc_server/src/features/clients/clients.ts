import { FeatureHttpController } from "../../core/controllers/feature_http_controller";
import {
  SubRouter,
  AccessLevel,
  CallBackStrategyPagination,
  CallbackStrategyCreateDbModel,
  CallbackStrategyUpdateModel,
  CallBackStrategyDeleteModelByQueryId,
  CallbackFind,
  CallbackStrategyWithValidationModel,
  ResponseBase,
} from "../../core/controllers/http_controller";
import { ClassConstructor } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { QueryIdModel } from "../../core/models/query_id_model";
import { Result } from "../../core/helpers/result";

export class ClientModel {
  @IsString()
  name: string;
  @IsString()
  family: string;
  @IsString()
  surName: string;
  @IsString()
  numberPhone: string;
}

export class ClientEditModel extends ClientModel {
  @IsNumber()
  id: number;
}

export class GetPaginationClients extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "client";
}

export class CreateClient extends CallbackStrategyCreateDbModel<ClientModel> {
  dbCollectionName: string = "client";
  validationModel: ClassConstructor<ClientModel> = ClientModel;
}

export class EditClient extends CallbackStrategyUpdateModel<ClientEditModel> {
  validationModel: ClassConstructor<ClientEditModel> = ClientEditModel;
  dbCollectionName: string = "client";
}

export class DeleteClient extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "client";
}
export class FindClient extends CallbackFind {
  dbCollectionName: string = "client";
}
export class ClientById extends CallbackStrategyWithValidationModel<QueryIdModel> {
  validationModel: ClassConstructor<QueryIdModel> = QueryIdModel;
  call = async (model: QueryIdModel): ResponseBase =>
    Result.isNotNull(
      await this.client.client.findFirst({ where: { id: Number(model.id) } })
    );
}
export class ClientsFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/clients",
        new GetPaginationClients(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter(
        "/clients/find",
        new FindClient(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter("/clients", new CreateClient(), AccessLevel.public, "POST"),
      new SubRouter("/clients", new EditClient(), AccessLevel.public, "PUT"),
      new SubRouter(
        "/client/by/id",
        new ClientById(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/clients",
        new DeleteClient(),
        AccessLevel.public,
        "DELETE"
      ),
    ];
  }
}
