import "reflect-metadata";
import {Type} from "./type";
import {ReflectContext} from "./reflectContext";
import {Method} from "./method";
import {matchingAnnotations, Constructor} from "./util";

/**
 * Information on a [[Method]] parameter.
 *
 * <uml>
 * hide members
 * hide circle
 * Method *-- Parameter : parameters
 * Parameter <-- Method : method
 * Parameter <-- Type : type
 * </uml>
 */
export class Parameter {

    /**
     * The name of the parameter.
     */
    name: string;

    /**
     * The position of the parameter in the [[Method]] parameter list.
     */
    index: number;

    /**
     * The [[Method]] that owns this parameter.
     */
    method: Method;

    /**
     * The [[Type]] of the parameter. (Only available if the --emitDecoratorMetadata compiler option is enabled and the method is decorated.)
     */
    type: Type;

    /**
     * @hidden
     */
    private _context: ReflectContext;

    /**
     * Creates a [[Parameter]] object.
     * @param context The [[ReflectContext]] that is managing this parameter.
     * @param method The [[Method]] that owns this parameter.
     * @param name The name of the parameter.
     * @param index The position of the parameter in the [[Method]] parameter list.
     * @param type The [[Type]] of the parameter.
     * @hidden
     */
    constructor(context: ReflectContext, method: Method, name: string, index: number, type: Type) {

        this.method = method;
        this.name = name;
        this.index = index;
        this.type = type;
        this._context = context;
    }

    /**
     * Gets a list of annotations for the parameter.
     */
    getAnnotations(): any[];

    /**
     * Gets a list of the specified type of annotations for the parameter.
     * @param annotationCtr The constructor function used to filter the annotations.
     */
    getAnnotations<T>(annotationCtr: Constructor<T>) : T[];
    getAnnotations(annotationCtr?: any): any[] {

        return matchingAnnotations(annotationCtr, this._getOwnMetadata());
    }

    /**
     * Checks if the parameter has the specified type of annotation.
     * @param annotationCtr The constructor function for the annotation to look for.
     */
    hasAnnotation(annotationCtr: Constructor<any>) : boolean {

        return this.getAnnotations(annotationCtr).length > 0;
    }

    /**
     * @hidden
     */
    private _getOwnMetadata(): any[] {

        var parameters = Reflect.getOwnMetadata('parameters', this.method.parent.ctr.prototype, this.method.name) || [];
        return parameters[this.index] || [];
    }
}
