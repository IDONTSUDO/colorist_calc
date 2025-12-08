export declare enum WorkerType {
    EXEC = "EXEC",
    SPAWN = "SPAWN"
}
export interface WorkerDataExec {
    command: string;
    execPath: string;
    type: WorkerType;
    cliArgs: Array<string> | undefined;
}
