import {Type} from "./type";
import {Constructor} from "./constructor";

export class ReflectContext {

    private _types: WeakMap<any, Type> = new WeakMap();

    getType(ctr: Constructor<any> | Function): Type {

        if(ctr === void 0) {
            return void 0;
        }

        if(typeof ctr !== "function") {
            return null;
        }

        var type = this._types.get(ctr);
        if(!type) {
            type = new Type(this, <Constructor<any>>ctr);
            this._types.set(ctr, type);
        }
        return type;
    }
}