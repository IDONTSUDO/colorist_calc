import { validationModelMiddleware } from "../middlewares/validation_model";
import { Result } from "../helpers/result";
import { Router, Request, Response } from "express";
import { CoreValidation } from "../validations/core_validation";
import { ClassConstructor, plainToInstance, Type } from "class-transformer";
import { IRouteModel, Routes } from "../models/routes";
import { IsString, validate, ValidationError } from "class-validator";
import { Prisma, PrismaClient } from "@prisma/client";
export abstract class EditModel {
  id: number;
}

export enum AccessLevel {
  public,
  admin,
  user,
  adminUser,
}

export type HttpMethodType =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "PATCH"
  | "HEAD";

export type ResponseBase = Promise<Result<any, any>>;

export class CallbackCore {
  currentSession: string = "unknown";
  client = new PrismaClient();
  getUserIdNumber = () => Number(this.currentSession);
  getUserId = async (): Promise<Result<void, Prisma.UserWhereInput>> => {
    return Result.isNotNull(
      await this.client.user.findFirst({
        where: { id: Number(this.currentSession) },
      })
    );
  };
}

export abstract class CallbackStrategyWithEmpty extends CallbackCore {
  abstract call(): ResponseBase;
}
export abstract class CallbackStrategyWithValidationModel<
  V,
> extends CallbackCore {
  abstract validationModel: ClassConstructor<V>;

  abstract call(model: V): ResponseBase;
}

export abstract class CallbackStrategyCreateDbModel<V> extends CallbackCore {
  abstract validationModel: ClassConstructor<V>;
  abstract dbCollectionName: string;
  modelHelper(model: V) {
    return model;
  }
  call = async (model: V) => {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].create({
        data: this.modelHelper(model),
      });
      this.afterCallback(result.id);
    } catch (error) {
      //TODO: нужна нормальная обработка ошибок
      console.log(error);
    }
    return Result.isNotNull(result);
  };
  async afterCallback(id: number) {}
}

export abstract class CallbackStrategyUpdateModel<
  V extends EditModel,
> extends CallbackCore {
  abstract dbCollectionName: string;
  abstract validationModel: ClassConstructor<V>;
  call = async (model: V): ResponseBase => {
    try {
      const obj = Object.assign(
        await this.client[`${this.dbCollectionName}`].findUnique({
          where: { id: model.id },
        }),
        model
      );

      delete obj["id"];

      return Result.isNotNull(
        await this.client[`${this.dbCollectionName}`].update({
          where: {
            id: model.id,
          },
          data: obj,
        })
      );
    } catch (error) {
      return Result.error(error);
    }
  };
}
export abstract class CallbackStrategyWithIdQuery extends CallbackCore {
  abstract idValidationExpression: CoreValidation;
  abstract call(id: string): ResponseBase;
}
export abstract class CallBackStrategyWithQueryPage extends CallbackCore {
  abstract validationPageExpression: RegExp | null;
  abstract call(page: string): ResponseBase;
}
export abstract class CallBackStrategyDeleteModelByQueryId extends CallbackCore {
  abstract dbCollectionName: string;
  validationPageExpression: RegExp = RegExp("id");
  async call(id: number): ResponseBase {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].delete({
        where: { id: id },
      });
    } catch (e) {
      result = null;
    }
    return Result.isNotNull(result).map(async () => {
      await this.deleteCallback?.(id);
      return Result.ok("delete");
    });
  }
  abstract deleteCallback: undefined | callbackUpdateDelete;
}

export abstract class CallbackFind extends CallbackCore {
  abstract dbCollectionName: string;
  async call(prop: string, value: string): ResponseBase {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].findMany({
        where: {
          [prop]: {
            contains: value,
            mode: "insensitive",
          },
        },
      });
    } catch (e) {
      console.log(e);
      result = null;
    }
    return Result.isNotNull(result);
  }
}

class Prop {
  @IsString()
  key: string;
  @IsString()
  value: string;
}
export class FindQuery {
  @IsString()
  logicQuery: string = "OR";
  @Type(() => Prop)
  prop: Prop[];
}

export abstract class FindMultiProp extends CallbackCore {
  model = FindQuery ;
  abstract dbCollectionName: string;
  async call(model: FindQuery): ResponseBase {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].findMany({
        where: {
          [model.logicQuery]: model.prop.map((el) => {
            return {
              [el.key]: { contains: el.value, mode: "insensitive" },
            };
          }),
        },
      });
    } catch (e) {
      console.log(e);
      result = null;
    }
    return Result.isNotNull(result);
  }
}
// const p = new Prop();
// p.key = "name";
// p.value = "1";
// const p1 = new Prop();
// p1.key = "family";
// p1.value = "1";
// const findQuery = new FindQuery();
// findQuery.logicQuery = "AND";
// findQuery.prop = [p, p1];

// new FindMulti().call(findQuery).then((data) => {
//   console.log(data);
// });
export type callbackUpdateDelete = (id: number) => Promise<void>;
export abstract class CallBackStrategyPagination<T> extends CallbackCore {
  pageSize: number = 10;
  abstract dbCollectionName: string;

  where: T | undefined = undefined;
  validationPageExpression: RegExp = RegExp("/^d+$/");
  orderBy?: {};
  call = async (page: number): ResponseBase => {
    let result = null;
    const skip = (page - 1) * 10;
    const take = 10;

    try {
      result = await this.client[`${this.dbCollectionName}`].findMany({
        skip,
        take,
        orderBy: this.orderBy,
      });
    } catch (error) {
      result = null;
    }
    return Result.isNotNull(result);
  };
  async helper(skip: number, responseBase: ResponseBase): ResponseBase {
    return (await responseBase).fold(
      async (success) => {
        const totalCount =
          await this.client[`${this.dbCollectionName}`].count();

        return Result.ok({
          data: success,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / this.pageSize),
          currentPage: skip,
        });
      },
      async () => Result.error("CallBackStrategyPagination query error")
    );
  }
}

export abstract class CallBackStrategyDeleteModelByQueryIdV2 extends CallbackCore {
  dbCollectionName: string;
  validationPageExpression: RegExp = RegExp("id");
  constructor(dbCollectionName: string) {
    super();
    this.dbCollectionName = dbCollectionName;
  }
  async call(id: number): ResponseBase {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].delete({
        where: { id: id },
      });
    } catch (e) {
      result = null;
    }
    return Result.isNotNull(result).map(async () => {
      await this.deleteCallback?.(id);
      return Result.ok("delete");
    });
  }
  abstract deleteCallback: undefined | callbackUpdateDelete;
}

export abstract class CallbackStrategyUpdateModelV2<
  V extends EditModel,
> extends CallbackCore {
  dbCollectionName: string;
  validationModel: ClassConstructor<V>;
  constructor(validationModel: ClassConstructor<V>, dbCollectionName: string) {
    super();
    this.validationModel = validationModel;
    this.dbCollectionName = dbCollectionName;
  }
  call = async (model: V): ResponseBase =>
    Result.isNotNull(
      await this.client[`${this.dbCollectionName}`].update({
        where: {
          id: model.id,
        },
        data: Object.assign(
          await this.client[`${this.dbCollectionName}`].findUnique({
            where: { id: model.id },
          }),
          model
        ),
      })
    );
}

export abstract class CallBackStrategyPaginationV2<T> extends CallbackCore {
  pageSize: number = 10;
  dbCollectionName: string;
  where: T | undefined = undefined;
  validationPageExpression: RegExp = RegExp("/^d+$/");
  call = async (page: number): ResponseBase => {
    console.log(this.dbCollectionName);
    let result = null;
    const skip = (page - 1) * 10;
    const take = 10;

    try {
      result = await this.client[`${this.dbCollectionName}`].findMany({
        skip,
        take,
      });
    } catch (error) {
      result = null;
    }
    return Result.isNotNull(result);
  };
  async helper(skip: number, responseBase: ResponseBase): ResponseBase {
    return (await responseBase).fold(
      async (success) => {
        const totalCount =
          await this.client[`${this.dbCollectionName}`].count();

        return Result.ok({
          data: success,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / this.pageSize),
          currentPage: skip,
        });
      },
      async () => Result.error("CallBackStrategyPagination query error")
    );
  }
}
export abstract class CallbackStrategyCreateDbModelV2<V> extends CallbackCore {
  validationModel: ClassConstructor<V>;
  dbCollectionName: string;
  constructor(validationModel: ClassConstructor<V>, dbCollectionName: string) {
    super();
    this.validationModel = validationModel;
    this.dbCollectionName = dbCollectionName;
  }
  modelHelper(model: V) {
    return model;
  }
  call = async (model: V) => {
    let result = null;
    try {
      result = await this.client[`${this.dbCollectionName}`].create({
        data: this.modelHelper(model),
      });
      this.afterCallback(result.id);
    } catch (error) {
      //TODO: нужна нормальная обработка ошибок
      console.log(error);
    }
    return Result.isNotNull(result);
  };
  async afterCallback(id: number) {}
}
export abstract class CallbackStrategyWithFileUpload extends CallbackCore {
  abstract checkingFileExpression: RegExp;
  abstract idValidationExpression: CoreValidation;
  abstract call(file: File, id: string): ResponseBase;
}
export abstract class CallbackStrategyWithFilesUploads extends CallbackCore {
  abstract chuckingFileExpressions: RegExp[];
  abstract call(files: File[]): ResponseBase;
}

export class SubRouter<A> implements ISubSetFeatureRouter<A> {
  method?: HttpMethodType;
  accessLevel: AccessLevel;
  subUrl: string;
  fn:
    | CallbackStrategyWithValidationModel<A>
    | CallbackStrategyWithEmpty
    | CallbackStrategyWithIdQuery
    | CallBackStrategyWithQueryPage
    | CallbackStrategyWithFileUpload
    | CallbackStrategyWithFilesUploads
    | CallBackStrategyPagination<A>
    | CallbackStrategyUpdateModel<any>
    | CallBackStrategyDeleteModelByQueryId
    | FindMultiProp
    | CallbackFind;
  constructor(
    subUrl: string,
    fn:
      | CallbackStrategyWithValidationModel<A>
      | CallbackStrategyWithEmpty
      | CallbackStrategyWithIdQuery
      | CallBackStrategyWithQueryPage
      | CallbackStrategyWithFileUpload
      | CallbackStrategyWithFilesUploads
      | CallBackStrategyPagination<A>
      | CallbackStrategyUpdateModel<any>
      | CallBackStrategyDeleteModelByQueryId
      | FindMultiProp
      | CallbackFind,

    accessLevel = AccessLevel.user,
    method?: HttpMethodType
  ) {
    this.fn = fn;
    this.subUrl = subUrl;
    this.method = method;
    this.accessLevel = accessLevel;
  }
}

export interface ISubSetFeatureRouter<A> {
  method?: HttpMethodType;
  accessLevel: AccessLevel;

  subUrl: string;
  fn:
    | CallbackStrategyWithValidationModel<A>
    | CallbackStrategyWithEmpty
    | CallbackStrategyWithIdQuery
    | CallBackStrategyWithQueryPage
    | CallbackStrategyWithFileUpload
    | CallbackStrategyWithFilesUploads
    | CallBackStrategyPagination<A>
    | CallbackStrategyUpdateModel<any>
    | CallBackStrategyDeleteModelByQueryId
    | FindMultiProp
    | CallbackFind;
}

abstract class ICoreHttpController {
  abstract mainURL: string;
  public router = Router();
  abstract call(): Promise<Routes>;
}

export class CoreHttpController<V> implements ICoreHttpController {
  mainURL: string;
  validationModel: any;
  subRoutes: ISubSetFeatureRouter<V>[] = [];

  routes = {
    POST: null,
    GET: null,
    DELETE: null,
    PUT: null,
  };

  public router = Router();

  constructor(routerModel: IRouteModel) {
    this.mainURL = "/" + routerModel.url;
    this.validationModel = routerModel.validationModel;
  }
  async responseHelper(res: Response, fn: ResponseBase) {
    (await fn).fold(
      (ok) => {
        res.json(ok);
        return;
      },
      (err) => {
        res.status(400).json({ error: String(err) });
        return;
      }
    );
  }
  async call(): Promise<Routes> {
    if (this.subRoutes.isNotEmpty()) {
      this.subRoutes.map(async (el) => {
        let url = el.subUrl;
        if (el.subUrl.at(0) !== "/") {
          url = `/${el.subUrl}`;
        }
        const finalUrl = (this.mainURL + url).replaceAll("///", "/");

        this.router[el.method === undefined ? "post" : el.method.toLowerCase()](
          finalUrl,
          async (req, res) => {
            if (el.fn instanceof CallbackStrategyUpdateModel) {
              (await valid(el.fn.validationModel, req.body)).fold(
                // @ts-expect-error
                (s) => this.responseHelper(res, el.fn.call(s)),
                (e) => res.status(400).json(e)
              );

              return;
            }
            if (el.fn instanceof CallbackStrategyWithValidationModel) {
              (await valid(el.fn.validationModel, req.body)).fold(
                // @ts-expect-error
                (s) => this.responseHelper(res, el.fn.call(s)),
                (e) => res.status(400).json(e)
              );

              return;
            }
            if (el.fn instanceof CallbackStrategyWithIdQuery) {
              if (req.query.id === undefined) {
                res
                  .status(400)
                  .json(
                    "request query id is null, need query id ?id={id:String}"
                  );
                return;
              }
              if (el.fn.idValidationExpression !== undefined) {
                if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
                  res
                    .status(400)
                    .json(
                      `request query id  must fall under the pattern: ${el.fn.idValidationExpression.regExp} message: ${el.fn.idValidationExpression.message} `
                    );
                  return;
                } else {
                  await this.responseHelper(res, el.fn.call(req.query.id));
                }
              } else {
                await this.responseHelper(
                  res,
                  el.fn.call(req["files"]["file"])
                );
              }
            }
            if (el.fn instanceof CallBackStrategyWithQueryPage) {
              throw Error("needs to be implimed");
            }
            if (el.fn instanceof CallbackStrategyWithEmpty) {
              await this.responseHelper(res, el.fn.call());
              return;
            }

            if (el.fn instanceof CallbackStrategyWithFileUpload) {
              if (req["files"] === undefined) {
                res.status(400).json("need files to form-data request");
                return;
              }

              if (req["files"]["file"] === undefined) {
                res.status(400).json("need file to form data request");
                return;
              }

              if (req.query.id === undefined) {
                res
                  .status(400)
                  .json(
                    "request query id is null, need query id ?id={id:String}"
                  );
                return;
              }
              if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
                res.status(400).json(el.fn.idValidationExpression.message);
                return;
              }
              if (el.fn instanceof CallbackStrategyWithFileUpload) {
                if (
                  !el.fn.checkingFileExpression.test(
                    req["files"]["file"]["name"]
                  )
                ) {
                  res
                    .status(400)
                    .json(
                      "a file with this extension is expected: " +
                        String(el.fn.checkingFileExpression)
                    );
                  return;
                }
              }

              await this.responseHelper(
                res,
                el.fn.call(req["files"]["file"], req.query.id)
              );
            }
          }
        );
      });
    }
    if (this.routes["POST"] != null) {
      this.router.post(
        this.mainURL,
        validationModelMiddleware(this.validationModel),
        (req, res) =>
          this.requestResponseController<V>(req, res, this.routes["POST"])
      );
    }
    if (this.routes["DELETE"] != null) {
      this.router.delete(this.mainURL, (req, res) =>
        this.requestResponseController<V>(req, res, this.routes["DELETE"])
      );
    }
    if (this.routes["PUT"] != null) {
      this.router.put(
        this.mainURL,
        validationModelMiddleware(this.validationModel),
        (req, res) =>
          this.requestResponseController<V>(req, res, this.routes["PUT"])
      );
    }
    if (this.routes["GET"] != null) {
      this.router.get(this.mainURL, (req, res) =>
        this.requestResponseController<V>(req, res, this.routes["GET"])
      );
    }

    return {
      router: this.router,
    };
  }
  public put(usecase: any) {
    this.routes["PUT"] = usecase;
  }
  public delete(usecase: any) {
    this.routes["DELETE"] = usecase;
  }
  public async requestResponseController<T>(
    req: Request,
    res: Response,
    usecase: CallbackStrategyWithValidationModel<T>
  ) {
    let payload = null;
    const useCase = usecase as any;
    if (req["model"] != undefined) {
      payload = req.body as T;
    }

    if (req.query.page !== undefined) {
      payload = String(req.query.page);
    }
    if (req.query.id !== undefined) {
      payload = String(req.query.id);
    }
    (await useCase(payload)).fold(
      (ok) => {
        return res.json(ok);
      },

      (err) => {
        return res.status(400).json({ error: String(err) });
      }
    );
  }
  public post(usecase: any) {
    this.routes["POST"] = usecase;
  }

  public get(usecase: any) {
    this.routes["GET"] = usecase;
  }
}

export const valid = async <T>(
  validationModelType: any,
  object
): Promise<Result<string, T>> => {
  const model = plainToInstance(
    validationModelType,
    object
  ) as unknown as object;

  const errors: ValidationError[] = await validate(model, {
    skipMissingProperties: false,
    whitelist: false,
    forbidNonWhitelisted: true,
  });

  if (errors.isNotEmpty()) {
    const message = errors.map((error: ValidationError) => {
      let result = "";
      if (error.children)
        error.children.map((el) => {
          if (el.constraints) {
            result += Object.values(el.constraints).join(", ");
          }
        });
      if (error.constraints)
        result += Object.values(error.constraints).join(", ");
      return result;
    });
    return Result.error(message.join(", \n"));
  } else {
    return Result.ok(model as unknown as T);
  }
};
