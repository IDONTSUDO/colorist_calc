import { Router } from "express";
import { Routes } from "../models/routes";
import {
  AccessLevel,
  CallbackFind,
  CallbackStrategyCreateDbModel,
  CallBackStrategyDeleteModelByQueryId,
  CallBackStrategyPagination,
  CallbackStrategyUpdateModel,
  CallbackStrategyWithEmpty,
  CallbackStrategyWithFileUpload,
  CallbackStrategyWithIdQuery,
  CallBackStrategyWithQueryPage,
  CallbackStrategyWithValidationModel,
  CoreHttpController,
  FindMultiProp,
  ISubSetFeatureRouter,
  valid,
} from "./http_controller";
import {
  validationMiddleware,
  validationMiddlewareNotResponse,
} from "../middlewares/validation_user_auth";
import { validationModel } from "../middlewares/validation_model_fn";


export class FeatureHttpController extends CoreHttpController<any> {
  subRoutes: ISubSetFeatureRouter<any>[] = [];

  constructor() {
    super({ url: "/" });
  }
  async call(): Promise<Routes> {
    return {
      router: this.router.use(
        await Promise.all(
          this.subRoutes.map(async (el) => {
            let url = el.subUrl;
            if (el.subUrl.at(0) !== "/") {
              url = `/${el.subUrl}`;
            }
            const finalUrl = (this.mainURL + url).replaceAll("///", "/");
            const router = Router();

            router[el.method === undefined ? "post" : el.method.toLowerCase()](
              finalUrl,
              async (req, res) => {
                let needNext = false;
                if (el.accessLevel === AccessLevel.public) {
                  needNext = true;
                }
                if (el.accessLevel === AccessLevel.user) {
                  needNext = validationMiddleware(
                    req,
                    res,
                    process.env.USER_JWT_SECRET
                  );
                }
                if (el.accessLevel === AccessLevel.admin) {
                  needNext = validationMiddleware(
                    req,
                    res,
                    process.env.ADMIN_JWT_SECRET
                  );
                }
                if (el.accessLevel === AccessLevel.adminUser) {
                  needNext = validationMiddlewareNotResponse(
                    req,
                    res,
                    process.env.USER_JWT_SECRET
                  );
                }
                if (needNext) {
                  if (req.user != undefined) {
                    el.fn.currentSession = req.user.userId;
                  }
                  if (el.fn instanceof CallBackStrategyDeleteModelByQueryId) {
                    if (el.fn.validationPageExpression.test(req.query.id)) {
                      res.status(400).json("need ?page=1");
                      return;
                    } else {
                      await this.responseHelper(
                        res,
                        el.fn.call(Number(req.query.id))
                      );
                    }
                    return;
                  }
                  if (el.fn instanceof CallbackStrategyCreateDbModel) {
                    (await valid(el.fn.validationModel, req.body)).fold(
                      // @ts-expect-error
                      (s) => this.responseHelper(res, el.fn.call(s)),
                      (e) => res.status(400).json(e)
                    );

                    return;
                  }
                  if (el.fn instanceof CallbackStrategyUpdateModel) {
                    (await valid(el.fn.validationModel, req.body)).fold(
                      // @ts-expect-error
                      (s) => this.responseHelper(res, el.fn.call(s)),
                      (e) => res.status(400).json(e)
                    );

                    return;
                  }
                  if (el.fn instanceof FindMultiProp) {
                    (await validationModel(el.fn.model, req.body)).fold(
                      async (ok) =>
                        // @ts-ignore
                        await this.responseHelper(res, el.fn.call(ok)),
                      async (err) => res.status(400).json(err)
                    );
                    return;
                  }
                  if (el.fn instanceof CallbackFind) {
                    if (req.body.prop === undefined) {
                      return res.status(400).json("need prop key");
                    }
                    if (req.body.value === undefined) {
                      return res.status(400).json("need value key");
                    }

                    await this.responseHelper(
                      res,
                      el.fn.call(req.body.prop, req.body.value)
                    );
                    return;
                  }
                  if (el.fn instanceof CallBackStrategyPagination) {
                    if (el.fn.validationPageExpression.test(req.query.page)) {
                      res.status(400).json("need ?page=1");
                      return;
                    } else {
                      await this.responseHelper(
                        res,
                        el.fn.helper(
                          Number(req.query.page),
                          el.fn.call(Number(req.query.page))
                        )
                      );
                    }
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
                      if (
                        !el.fn.idValidationExpression.regExp.test(req.query.id)
                      ) {
                        res
                          .status(400)
                          .json(
                            `request query id  must fall under the pattern: ${el.fn.idValidationExpression.regExp} message: ${el.fn.idValidationExpression.message} `
                          );
                        return;
                      } else {
                        await this.responseHelper(
                          res,
                          el.fn.call(req.query.id)
                        );
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
                    if (
                      !el.fn.idValidationExpression.regExp.test(req.query.id)
                    ) {
                      res
                        .status(400)
                        .json(el.fn.idValidationExpression.message);
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
              }
            );

            return router;
          })
        )
      ),
    };
  }
}
