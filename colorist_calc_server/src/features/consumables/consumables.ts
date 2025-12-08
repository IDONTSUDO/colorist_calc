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
import { IsArray, IsNumber, IsString } from "class-validator";

export class ConsumablesModel {
  @IsNumber(
    {},
    { message: "Поле цена за единицу измеренеия является обязательным и должно быть числом" }
  )
  costPrice: number; //цена за единицу измеренеия
  @IsString({ message: "Поле описание является обязательным" })
  description: string; // описание
  @IsNumber({}, { message: "Поле текущий является обязательным и должно быть числом" })
  currentBalance: number; // текущий остаток
  @IsString({ message: "Поле еденица измерения является обязательным" })
  unitOfMeasurement: string; //еденица измерения
}

export class ConsumablesEditModel extends ConsumablesModel {
  @IsNumber()
  id: number;
}

export class GetConsumablesPagination extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "consumables";
}

export class CreateConsumables extends CallbackStrategyCreateDbModel<ConsumablesModel> {
  dbCollectionName: string = "consumables";
  validationModel: ClassConstructor<ConsumablesModel> = ConsumablesModel;
}

export class EditConsumables extends CallbackStrategyUpdateModel<ConsumablesEditModel> {
  validationModel: ClassConstructor<ConsumablesEditModel> =
    ConsumablesEditModel;
  dbCollectionName: string = "consumables";
}

export class DeleteConsumables extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "consumables";
}
export class FindConsumables extends CallbackFind {
  dbCollectionName: string = "consumables";
}
export class ConsumablesFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/consumables",
        new GetConsumablesPagination(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter(
        "/consumables/find",
        new FindConsumables(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/consumables",
        new CreateConsumables(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/consumables",
        new EditConsumables(),
        AccessLevel.public,
        "PUT"
      ),
      new SubRouter(
        "/consumables",
        new DeleteConsumables(),
        AccessLevel.public,
        "DELETE"
      ),
    ];
  }
}
