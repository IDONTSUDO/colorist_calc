import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Result } from "../helpers/result";

export const validationModel = async (
  type: any,
  value: any,
  skipMissingProperties = false,
  whitelist = false,
  forbidNonWhitelisted = true
): Promise<Result<string, any>> => {
  const model = plainToInstance(type, value);
  return validate(model, {
    skipMissingProperties,
    whitelist,
    forbidNonWhitelisted,
  }).then((errors: ValidationError[]) => {
    console.log(errors);
    if (errors.length > 0) {
      const message = errors
        .map((error: ValidationError) => Object.values(error.constraints))
        .join(", ");
      return Result.error(message);
    } else {
      console.log(200);
      return Result.ok(model);
    }
  });
};
