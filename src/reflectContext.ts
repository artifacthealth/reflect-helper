import {Type} from "./type";
import {Constructor} from "./util";

export class ReflectContext {

    /**
     * A map of Type objects for a given concrete type.
     * @hidden
     */
    private _types: WeakMap<any, Type> = new WeakMap();

    /**
     * Gets type metadata for the specified concrete type.
     * @param ctr The concrete type.
     */
    getType(ctr: Constructor<any> | Function): Type {

        if(ctr === undefined) {
            return undefined;
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