import { Constructor } from "./util";
import { Type } from "./type";
import { ReflectContext } from "./reflectContext";

export { makeDecorator, decorate } from "./util";
export { ReflectContext } from "./reflectContext";
export { Type } from "./type";
export { Property } from "./property";
export { Parameter } from "./parameter";
export { Method } from "./method";

/**
 * Global reflection context if global getType is used.
 */
var context: ReflectContext;

/**
 * Gets type metadata for the specified concrete type.
 * @param ctr The concrete type.
 */
export function getType(ctr: Constructor<any> | Function): Type {

    if(!context) {
        context = new ReflectContext();
    }

    return context.getType(ctr);
}
