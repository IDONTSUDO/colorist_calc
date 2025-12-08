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

export class RecipesModel {
  @IsArray()
  componentsIds: number[];
  @IsNumber()
  weightOfIngredientsAccordingToTheRecipe: number;
  @IsNumber()
  weightOfTheCan: number;
  @IsNumber()
  actualWeightOfComponents: number;
  @IsNumber()
  weightOfComponentsAfterDusting: number;
  @IsString()
  auto: string;
  @IsString()
  cardIndexNumber: string;
  components: any;
}

export class RecipesEditModel extends RecipesModel {
  @IsNumber()
  id: number;
}

export class GetRecipesPagination extends CallBackStrategyPagination<any> {
  dbCollectionName: string = "recipe";
}

export class CreateRecipes extends CallbackStrategyCreateDbModel<RecipesModel> {
  dbCollectionName: string = "recipe";
  validationModel: ClassConstructor<RecipesModel> = RecipesModel;
}

export class EditRecipes extends CallbackStrategyUpdateModel<RecipesEditModel> {
  validationModel: ClassConstructor<RecipesEditModel> = RecipesEditModel;
  dbCollectionName: string = "recipe";
}

export class DeleteRecipes extends CallBackStrategyDeleteModelByQueryId {
  deleteCallback = undefined;
  dbCollectionName: string = "recipe";
}
export class FindRecipes extends CallbackFind {
  dbCollectionName: string = "recipe";
}
export class RecipesFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter(
        "/recipes",
        new GetRecipesPagination(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter(
        "/recipes/find",
        new FindRecipes(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter(
        "/recipes",
        new CreateRecipes(),
        AccessLevel.public,
        "POST"
      ),
      new SubRouter("/recipes", new EditRecipes(), AccessLevel.public, "PUT"),
      new SubRouter(
        "/recipes",
        new DeleteRecipes(),
        AccessLevel.public,
        "DELETE"
      ),
    ];
  }
}
