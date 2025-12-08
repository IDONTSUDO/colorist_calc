import { validationModelMiddleware } from "../middlewares/validation_model";
import { Router } from "express";
export class CallbackStrategyWithEmpty {
}
export class CallbackStrategyWithValidationModel {
}
export class CallbackStrategyWithIdQuery {
}
export class CallBackStrategyWithQueryPage {
}
export class CallbackStrategyWithFileUpload {
}
export class CallbackStrategyWithFilesUploads {
}
export class SubRouter {
    constructor(method, subUrl, fn) {
        this.fn = fn;
        this.subUrl = subUrl;
        this.method = method;
    }
}
class ICoreHttpController {
    constructor() {
        this.router = Router();
    }
}
export class CoreHttpController {
    constructor(routerModel) {
        this.subRoutes = [];
        this.routes = {
            POST: null,
            GET: null,
            DELETE: null,
            PUT: null,
        };
        this.router = Router();
        this.mainURL = "/" + routerModel.url;
        this.validationModel = routerModel.validationModel;
    }
    async responseHelper(res, fn) {
        (await fn).fold((ok) => {
            res.json(ok);
            return;
        }, (err) => {
            res.status(400).json({ error: String(err) });
            return;
        });
    }
    call() {
        if (this.subRoutes.isNotEmpty()) {
            this.subRoutes.map(async (el) => {
                this.router[el.method.toLowerCase()](this.mainURL + "/" + el.subUrl, async (req, res) => {
                    if (el.fn instanceof CallbackStrategyWithValidationModel) {
                        this.responseHelper(res, el.fn.call(req.body));
                        return;
                    }
                    if (el.fn instanceof CallbackStrategyWithIdQuery) {
                        if (req.query.id === undefined) {
                            res.status(400).json("request query id is null, need query id ?id={id:String}");
                            return;
                        }
                        if (el.fn.idValidationExpression !== undefined) {
                            if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
                                res
                                    .status(400)
                                    .json(`request query id  must fall under the pattern: ${el.fn.idValidationExpression.regExp} message: ${el.fn.idValidationExpression.message} `);
                                return;
                            }
                            else {
                                await this.responseHelper(res, el.fn.call(req.query.id));
                            }
                        }
                        else {
                            await this.responseHelper(res, el.fn.call(req["files"]["file"]));
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
                        // if (req.query.description === undefined) {
                        //   res
                        //     .status(400)
                        //     .json("request query description is null, need query description &description={description:String}");
                        //   return;
                        // }
                        if (req.query.id === undefined) {
                            res.status(400).json("request query id is null, need query id ?id={id:String}");
                            return;
                        }
                        if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
                            res.status(400).json(el.fn.idValidationExpression.message);
                            return;
                        }
                        if (el.fn instanceof CallbackStrategyWithFileUpload) {
                            if (!el.fn.checkingFileExpression.test(req["files"]["file"]["name"])) {
                                res.status(400).json("a file with this extension is expected: " + String(el.fn.checkingFileExpression));
                                return;
                            }
                        }
                        await this.responseHelper(res, el.fn.call(req["files"]["file"], req.query.id));
                    }
                });
            });
        }
        if (this.routes["POST"] != null) {
            this.router.post(this.mainURL, validationModelMiddleware(this.validationModel), (req, res) => this.requestResponseController(req, res, this.routes["POST"]));
        }
        if (this.routes["DELETE"] != null) {
            this.router.delete(this.mainURL, (req, res) => this.requestResponseController(req, res, this.routes["DELETE"]));
        }
        if (this.routes["PUT"] != null) {
            this.router.put(this.mainURL, validationModelMiddleware(this.validationModel), (req, res) => this.requestResponseController(req, res, this.routes["PUT"]));
        }
        if (this.routes["GET"] != null) {
            this.router.get(this.mainURL, (req, res) => this.requestResponseController(req, res, this.routes["GET"]));
        }
        return {
            router: this.router,
        };
    }
    put(usecase) {
        this.routes["PUT"] = usecase;
    }
    delete(usecase) {
        this.routes["DELETE"] = usecase;
    }
    async requestResponseController(req, res, usecase) {
        let payload = null;
        const useCase = usecase;
        if (req["model"] != undefined) {
            payload = req.body;
        }
        if (req.query.page !== undefined) {
            payload = String(req.query.page);
        }
        if (req.query.id !== undefined) {
            payload = String(req.query.id);
        }
        (await useCase(payload)).fold((ok) => {
            return res.json(ok);
        }, (err) => {
            return res.status(400).json({ error: String(err) });
        });
    }
    // TODO(IDONTSUDO):need fix to CallbackStrategyWithValidationModel<V>
    post(usecase) {
        this.routes["POST"] = usecase;
    }
    get(usecase) {
        this.routes["GET"] = usecase;
    }
}
