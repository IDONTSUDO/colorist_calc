import { IsString } from "class-validator";
import { FeatureHttpController } from "../../core/controllers/feature_http_controller";
import {
  AccessLevel,
  CallbackStrategyCreateDbModel,
  CallbackStrategyWithEmpty,
  CallbackStrategyWithValidationModel,
  ResponseBase,
  SubRouter,
} from "../../core/controllers/http_controller";
import { Result } from "../../core/helpers/result";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { QueryIdModel } from "../../core/models/query_id_model";
import { ClassConstructor } from "class-transformer";

const saltRounds = 10;

export class User {
  @IsString()
  login: string;
  @IsString()
  password: string;
}
export interface Payload {
  userId: string;
}
export class UserInfo extends CallbackStrategyWithValidationModel<QueryIdModel> {
  validationModel: ClassConstructor<QueryIdModel> = QueryIdModel;
  call = async (model: QueryIdModel): ResponseBase =>
    Result.isNotNull(
      await this.client.user.findFirst({ where: { id: model.id } })
    );
}

export class GetAllUsers extends CallbackStrategyWithEmpty {
  call = async (): ResponseBase =>
    Result.isNotNull(await this.client.user.findMany());
}
export class LoginUser extends CallbackStrategyWithValidationModel<User> {
  error = "Error";
  validationModel = User;
  call = async (model: User): ResponseBase =>
    Result.isNotNull(
      await this.client.user.findFirst({ where: { login: model.login } })
    ).fold(
      async (databaseModel) => {
        if (model.password === databaseModel.password) {
          return Result.ok({
            token: jwt.sign(
              { userId: databaseModel.id.toString() },
              process.env.USER_JWT_SECRET
            ),
          });
        }
        return Result.error(this.error);
      },
      async () => {
        return Result.error(this.error);
      }
    );
}

export class AdminModel {
  @IsString()
  login: string;
  @IsString()
  password: string;
}
// export class LoginAdmin extends CallbackStrategyWithValidationModel<AdminModel> {
//   validationModel = AdminModel;
//   call = async (model: AdminModel): ResponseBase =>
//     Result.isNotNull(
//       await this.client.admin.findFirst({
//         where: { login: model.login },
//       })
//     ).fold(
//       async (model) =>
//         Result.ok({
//           token: jwt.sign({ userId: model.id }, process.env.ADMIN_JWT_SECRET),
//         }),
//       async () => Result.error("user is not registered")
//     );
// }

class UserModel {
  @IsString()
  login: string;
  @IsString()
  name: string;
  @IsString()
  password: string;
}

export class CreateUser extends CallbackStrategyCreateDbModel<UserModel> {
  validationModel: ClassConstructor<UserModel> = UserModel;
  dbCollectionName = "user";
}

export class AuthorizationFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter("/login", new LoginUser(), AccessLevel.public),
      new SubRouter("/user/info", new UserInfo(), AccessLevel.public),
      new SubRouter(
        "/get/all/users",
        new GetAllUsers(),
        AccessLevel.public,
        "GET"
      ),
      new SubRouter("/create/user", new CreateUser(), AccessLevel.public),
      // new SubRouter("/admin/login", new LoginAdmin(), AccessLevel.public),
    ];
  }
}
