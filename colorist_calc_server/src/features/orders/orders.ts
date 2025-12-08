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
import { IsArray, IsInt, IsNumber, IsString } from "class-validator";
import { QueryIdModel } from "../../core/models/query_id_model";
import { Result } from "../../core/helpers/result";

export class OrderModel {
  @IsString({ message: "Поле авто является обязательным" })
  auto: string; //АВТО
  @IsString({ message: "Поле код краски является обязательным" })
  codePaint: string; //КОД КРАСКИ
  @IsString({ message: "Поле цвет краски является обязательным" })
  color: string; //ЦВЕТ
  @IsInt({
    message: "Поле обьем краски которую хочет клиент является обязательным",
  })
  theVolumeOfPainTheCustomerWant: number; //ОБЬЕМ КРАСКИ КОТОРУЮ ХОЧЕТ КЛИЕНТ в граммах
  @IsInt({ message: "Выберите клиента" })
  client: number; //ID model Client
  @IsString()
  statusOrder: string = "Начат"; //НАЧАТ,ЗАКОНЧЕН,ОТМЕНЕН
}

export class OrderEditModel extends OrderModel {
  @IsNumber()
  id: number;
}

export class GetOrderPagination extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "order";
  orderBy = {
    createdAt: "desc",
  };
}

export class CreateOrder extends CallbackStrategyCreateDbModel<OrderModel> {
  dbCollectionName: string = "order";
  validationModel: ClassConstructor<OrderModel> = OrderModel;
}

export class EditOrder extends CallbackStrategyUpdateModel<OrderEditModel> {
  validationModel: ClassConstructor<OrderEditModel> = OrderEditModel;
  dbCollectionName: string = "order";
}

export class DeleteOrder extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "order";
}
export class FindOrder extends CallbackFind {
  dbCollectionName: string = "order";
}
export class OrderById extends CallbackStrategyWithValidationModel<QueryIdModel> {
  validationModel: ClassConstructor<QueryIdModel> = QueryIdModel;
  call = async (model: QueryIdModel): ResponseBase =>
    Result.isNotNull(
      await this.client.order.findFirst({ where: { id: Number(model.id) } })
    );
}
export class OrdersFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/order",
        new GetOrderPagination(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter("/order/find", new FindOrder(), AccessLevel.public, "POST"),
      new SubRouter("/order", new CreateOrder(), AccessLevel.public, "POST"),
      new SubRouter("/order", new EditOrder(), AccessLevel.public, "PUT"),
      new SubRouter("/order", new DeleteOrder(), AccessLevel.public, "DELETE"),
      new SubRouter(
        "/order/by/id",
        new OrderById(),
        AccessLevel.public,
        "POST"
      ),
    ];
  }
}
