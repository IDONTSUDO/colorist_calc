import { FeatureHttpController } from "../../core/controllers/feature_http_controller";
import {
  SubRouter,
  AccessLevel,
  CallBackStrategyPagination,
  CallbackStrategyCreateDbModel,
  CallbackStrategyUpdateModel,
  CallBackStrategyDeleteModelByQueryId,
  CallbackFind,
} from "../../core/controllers/http_controller";
import { ClassConstructor } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class ComponentModel {
  @IsNumber()
  weight: number;
  @IsNumber()
  costPrice: string;
  @IsString()
  privateNumber: string;
  @IsNumber()
  currentBalance: number;
}

export class ComponentEditModel extends ComponentModel {
  @IsNumber()
  id: number;
}

export class GetComponentsPagination extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "component";
}

export class CreateComponent extends CallbackStrategyCreateDbModel<ComponentModel> {
  dbCollectionName: string = "component";
  validationModel: ClassConstructor<ComponentModel> = ComponentModel;
}

export class EditComponent extends CallbackStrategyUpdateModel<ComponentEditModel> {
  validationModel: ClassConstructor<ComponentEditModel> = ComponentEditModel;
  dbCollectionName: string = "component";
}

export class DeleteComponent extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "component";
}
export class FindComponents extends CallbackFind {
  dbCollectionName: string = "component";
}
export class ComponentsFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/components",
        new GetComponentsPagination(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter(
        "/components/find",
        new FindComponents(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/components",
        new CreateComponent(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/components",
        new EditComponent(),
        AccessLevel.public,
        "PUT"
      ),
      new SubRouter(
        "/components",
        new DeleteComponent(),
        AccessLevel.public,
        "DELETE"
      ),
    ];
  }
}
