import "reflect-metadata";
import {Parameter} from "./parameter";
import {Type} from "./type";
import {ReflectContext} from "./reflectContext";
import {Property} from "./property";
import {Constructor} from "./util";

// These RegEx and the code below for getParameterNames is modified code from AngularJS
var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

/**
 * Information on a method.
 *
 * <uml>
 * hide members
 * hide circle
 * Property <|-- Method
 * Type *-- Method : methods
 * Method <-- Type : returnType
 * Method *- Parameter : parameters
 * </uml>
 */
export class Method extends Property {

    /**
     * Invokes the method on the given object with the specified arguments.
     * @param obj The object to invoke the method on.
     * @param args A list of arguments to pass to the method.
     */
    invoke(obj: any, args?: any[]): any {

        this.invoke = <any>(new Function("o, a", "var m = o['" + this.name + "']; if(!m) throw new Error(\"Cannot invoke method '" + this.name + "'.\"); return m.apply(o, a)"));
        var method = obj[this.name];
        if (!method) {
            throw new Error("Cannot invoke method '" + this.name + "'.");
        }
        return method.apply(obj, args);
    }

    /**
     * @hidden
     */
    private _returnType: Type;

    /**
     * The return type of the method. (Only available if the --emitDecoratorMetadata compiler option is enabled and the method is decorated.)
     */
    get returnType(): Type {

        if(this._returnType === undefined) {
            this._returnType = this.context.getType(this._getReturnType());
        }
        return this._returnType;
    }

    /**
     * @hidden
     */
    private _getReturnType(): Constructor<any> {

        return Reflect.getMetadata('design:returntype', this.parent.ctr.prototype, this.name)
    }

    /**
     * @hidden
     */
    private _parameters: Parameter[];

    /**
     * A list of parameters for the method.
     */
    get parameters(): Parameter[] {

        if(!this._parameters) {
            this._parameters = this._getParameters();
        }

        return this._parameters;
    }

    /**
     * @hidden
     */
    private _getParameters(): Parameter[] {

        var names = this._getParameterNames(),
            types = this._getParameterTypes(),
            params: Parameter[] = new Array(names.length);

        for (var i = 0; i < params.length; i++) {
            params[i] = new Parameter(this.context, this, names[i], i, this.context.getType(types[i]));
        }

        return params;
    }

    /**
     * @hidden
     */
    private _getParameterTypes(): Constructor<any>[] {

        return Reflect.getMetadata('design:paramtypes', this.parent.ctr.prototype, this.name) || [];
    }

    /**
     * @hidden
     */
    private _getParameterNames(): string[] {

        var fn = this.parent.ctr.prototype[this.name];
        var names: string[] = [];

        var fnText = fn.toString().replace(STRIP_COMMENTS, '');
        var argDecl = fnText.match(FN_ARGS);
        if(argDecl[1]) {
            argDecl[1].split(FN_ARG_SPLIT).forEach((arg: string) => {
                names.push(arg.trim());
            });
        }

        return names;
    }
}

