import "reflect-metadata";
import {Constructor} from "./constructor";
import {Property} from "./property";
import {ReflectContext} from "./reflectContext";
import {matchingAnnotations} from "./util";
import {Method} from "./method";

export class Type {

    ctr: Constructor<any>;
    name: string;

    private _context: ReflectContext;

    constructor(context: ReflectContext, ctr: Constructor<any>) {

        if(!ctr) {
            throw new Error("Missing required argument 'ctr'.");
        }

        this.ctr = ctr;
        this.name = ctr === void 0 ? "undefined" : ctr.name;
        this._context = context;
    }

    getAnnotations(inherit?: boolean): any[];
    getAnnotations<T>(annotationCtr: Constructor<T>, inherit?: boolean) : T[];
    getAnnotations(inheritOrAnnotationCtr?: any, inherit?: boolean): any[] {

        var annotationCtr: Constructor<any>;

        if (typeof inheritOrAnnotationCtr === "function") {
            annotationCtr = inheritOrAnnotationCtr;
        }
        else if (typeof inheritOrAnnotationCtr === "boolean") {
            inherit = inheritOrAnnotationCtr;
        }

        var annotations = matchingAnnotations(annotationCtr, this._getOwnMetadata());

        if (inherit) {
            var baseType = this.baseType;
            if (baseType) {
                annotations = this.baseType.getAnnotations(annotationCtr, inherit).concat(annotations);
            }
        }

        return annotations;
    }

    hasAnnotation(annotationCtr: Constructor<any>, inherit?: boolean) : boolean {

        return this.getAnnotations(annotationCtr, inherit).length > 0;
    }

    private _properties: Property[];

    get properties(): Property[] {

        if(!this._properties) {
            this._properties = this._getPropertyNames().map(name => {
                return new Property(this._context, this, name);
            });
        }

        return this._properties;
    }

    private _methods: Method[];

    get methods(): Method[] {

        if(!this._methods) {
            this._methods = this._getMethodNames().map(name => {
                return new Method(this._context, this, name);
            });
        }

        return this._methods;
    }

    private _baseType: Type;

    get baseType(): Type {

        if(this._baseType === undefined) {
            this._baseType = this._context.getType(this._getBaseType());
        }
        return this._baseType;
    }

    get isNumber(): boolean {

        return this.ctr === Number;
    }

    get isString(): boolean {

        return this.ctr === String;
    }

    get isBoolean(): boolean {

        return this.ctr === Boolean;
    }

    get isArray(): boolean {

        return this.ctr === Array;
    }

    get isSet(): boolean {

        return this.ctr === Map;
    }

    get isFunction(): boolean {

        return this.ctr === Function;
    }

    get isIterable(): boolean {

        if (this.ctr == null || this.ctr.prototype == null) {
            return false;
        }
        return this.ctr.prototype[Symbol.iterator] !== undefined;
    }

    private _getBaseType(): Constructor<any> {

        var basePrototype = this.ctr && this.ctr.prototype && Object.getPrototypeOf(this.ctr.prototype);
        return basePrototype && basePrototype.constructor;
    }

    private _getPropertyNames(): string[] {

        var properties = Reflect.getOwnMetadata('propMetadata', this.ctr);
        if (properties) {
            return Object.getOwnPropertyNames(properties)
                .filter(p => typeof this.ctr.prototype[p] !== "function");
        }

        return [];
    }

    private _getMethodNames(): string[] {

        if(this.ctr) {
            return Object.getOwnPropertyNames(this.ctr.prototype)
                .filter(p => typeof this.ctr.prototype[p] === "function");
        }

        return [];
    }

    private _getOwnMetadata(): any[] {

        return Reflect.getOwnMetadata('annotations', this.ctr) || [];
    }

}

