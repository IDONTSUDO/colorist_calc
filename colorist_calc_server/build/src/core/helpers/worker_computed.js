import { EXEC_EVENT, EXEC_TYPE, ExecError } from "../models/exec_error_model";
import * as cp from "child_process";
import { ExecutorResult } from "../models/executor_result";
export var WorkerType;
(function (WorkerType) {
    WorkerType["EXEC"] = "EXEC";
    WorkerType["SPAWN"] = "SPAWN";
})(WorkerType || (WorkerType = {}));
process.on("message", async (message) => {
    const workerData = message;
    if (workerData.type == WorkerType.SPAWN) {
        const subprocess = cp.spawn(workerData.command, {
            cwd: workerData.execPath,
        });
        subprocess.stdout.on("data", (data) => {
            if (process.send) {
                process.send({
                    type: EXEC_TYPE.SPAWN.toString(),
                    event: EXEC_EVENT.PROGRESS.toString(),
                    data: data.toString(),
                });
            }
        });
        subprocess.on("close", (_code) => {
            if (process.send) {
                process.send({
                    type: EXEC_TYPE.SPAWN.toString(),
                    event: EXEC_EVENT.END.toString(),
                    data: null,
                });
            }
        });
        process.on("uncaughtException", (error) => {
            if (process.send) {
                process.send({
                    command: workerData.command,
                    execPath: workerData.execPath,
                    error: error,
                });
            }
        });
    }
    else if (workerData.type == WorkerType.EXEC) {
        try {
            const result = await exec(workerData.command, {
                cwd: workerData.execPath,
            });
            if (process.send) {
                process.send(new ExecutorResult(EXEC_TYPE.EXEC, EXEC_EVENT.END, result));
            }
        }
        catch (error) {
            if (process.send) {
                process.send(new ExecError(workerData.command, error));
            }
        }
    }
});
async function exec(cmd, opts = {}) {
    return new Promise((c, e) => {
        cp.exec(cmd, Object.assign({ env: process.env }, opts), (err, stdout) => {
            return err ? e(err) : c(opts.trim ? stdout.trim() : stdout);
        });
    });
}
