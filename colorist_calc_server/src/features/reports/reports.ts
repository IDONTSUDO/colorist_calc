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


export class ReportsModel {
  @IsArray()
  args?: [];
  report: string = "";
}
//отчет по прибыли
export class ProfitReportModel {}
//отчет по клиенту
export class ClientReportModel {}
// отчет по остатка
export class ConsumptionReportModel {}

export class ReportsEditModel extends ReportsModel {
  @IsNumber()
  id: number;
}

export class GetReportsPagination extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "reports";
}

export class CreateReports extends CallbackStrategyCreateDbModel<ReportsModel> {
  dbCollectionName: string = "reports";
  validationModel: ClassConstructor<ReportsModel> = ReportsModel;
}

export class EditReports extends CallbackStrategyUpdateModel<ReportsEditModel> {
  validationModel: ClassConstructor<ReportsEditModel> = ReportsEditModel;
  dbCollectionName: string = "reports";
}

export class DeleteReports extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "reports";
}
export class FindReports extends CallbackFind {
  dbCollectionName: string = "reports";
}
export class ReportsFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/reports",
        new GetReportsPagination(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter(
        "/reports/find",
        new FindReports(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/reports",
        new CreateReports(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter("/reports", new EditReports(), AccessLevel.public, "PUT"),
      new SubRouter(
        "/reports",
        new DeleteReports(),
        AccessLevel.public,
        "DELETE"
      ),
    ];
  }
}
