import { CoreHttpController } from "../../core/controllers/http_controller";
import { Result } from "../../core/helpers/result";
import { VM } from "vm2";
import * as tsNode from 'ts-node';
export class VmUseCase {
    constructor() {
        this.call = () => {
            tsNode.register();
            tsNode.register();
            const tsCode = `const a: number = 10;
        const b: number = 20;
        a + b; // Возвращает 30
        ;`;
            const vm = new VM();
            // Выполняем TypeScript код в контексте VM
            console.log(tsNode.create().compile(tsCode, ''));
            // const result = vm.run(tsNode.transpile(tsCode));
            // console.log(`Результат выполнения TypeScript кода: ${result}`);
            return Result.ok(undefined);
        };
    }
}
export class VmController extends CoreHttpController {
    constructor() {
        super({ url: "/vm" });
        this.subRoutes.push();
    }
}
