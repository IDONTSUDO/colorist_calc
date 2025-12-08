import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
export const validationModelMiddleware = (type, value = "body", skipMissingProperties = false, whitelist = false, forbidNonWhitelisted = true) => {
    return (req, res, next) => {
        if (type === null && type == undefined) {
            next();
            return;
        }
        const model = plainToInstance(type, req[value]);
        validate(model, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors) => {
            if (errors.length > 0) {
                const message = errors.map((error) => Object.values(error.constraints)).join(", ");
                return res.status(400).json(message);
            }
            else {
                req["model"] = model;
                next();
            }
        });
    };
};
