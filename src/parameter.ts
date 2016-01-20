import "reflect-metadata";
import {Type} from "./type";
import {ReflectContext} from "./reflectContext";
import {Method} from "./method";
import {Constructor} from "./constructor";
import {matchingAnnotations} from "./util";

export class Parameter {

    name: string;
    index: number;
    method: Method;
    type: Type;
    private _context: ReflectContext;

    constructor(context: ReflectContext, method: Method, name: string, index: number, type: Type) {

        this.method = method;
        this.name = name;
        this.index = index;
        this.type = type;
        this._context = context;
    }

    getAnnotations(): any[];
    getAnnotations<T>(annotationCtr: Constructor<T>) : T[];
    getAnnotations(annotationCtr?: any): any[] {

        return matchingAnnotations(annotationCtr, this._getOwnMetadata());
    }

    hasAnnotation(annotationCtr: Constructor<any>) : boolean {

        return this.getAnnotations(annotationCtr).length > 0;
    }

    private _getOwnMetadata(): any[] {

        var parameters = Reflect.getOwnMetadata('parameters', this.method.parent.ctr.prototype[this.method.name]) || [];
        return parameters[this.index] || [];
    }
}
