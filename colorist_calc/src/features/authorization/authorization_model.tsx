import { IsNotEmpty, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";

export class AuthorizationModel extends ValidationModel {
  @IsNotEmpty({ message: "поле логин не может быть пустой" })
  @IsString({ message: "поле логин должно быть строкой" })
  login: string;
  @IsNotEmpty({ message: "поле пароль не может быть пустой" })
  @IsString({ message: "поле пароль должно быть строкой" })
  password: string;

  static empty = () => new AuthorizationModel();
}
