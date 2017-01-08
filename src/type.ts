import "reflect-metadata";
import {Property} from "./property";
import {ReflectContext} from "./reflectContext";
import {matchingAnnotations, Constructor} from "./util";
import {Method} from "./method";

/**
 * Information on a concrete type.
 *
 * <uml>
 * hide members
 * hide circle
 * Type *-- Property : properties
 * Type *-- Method : methods
 * Type <-- Type : baseType
 * </uml>
 */
export class Type {

    /**
     * The constructor function for the type.
     */
    ctr: Constructor<any>;

    /**
     * The name of the type.
     */
    name: string;

    /**
     * @hidden
     */
    private _context: ReflectContext;

    /**
     * Creates a type object.
     * @param context The [[ReflectContext]] that is managing this type.
     * @param ctr The constructor function for the type.
     * @hidden
     */
    constructor(context: ReflectContext, ctr: Constructor<any>) {

        if(!ctr) {
            throw new Error("Missing required argument 'ctr'.");
        }

        this.ctr = ctr;
        this.name = ctr === void 0 ? "undefined" : ctr.name;
        this._context = context;
    }

    /**
     * Gets a list of annotations for the current type.
     * @param inherit Indicates if annotations from base types should be included. Default false.
     */
    getAnnotations(inherit?: boolean): any[];

    /**
     * Gets a list of the specified type of annotations for the current type.
     * @param annotationCtr The constructor function used to filter the annotations.
     * @param inherit Indicates if annotations from base types should be included. Default false.
     */
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
                annotations = baseType.getAnnotations(annotationCtr, inherit).concat(annotations);
            }
        }

        return annotations;
    }

    /**
     * Checks if the type has the specified type of annotation.
     * @param annotationCtr The constructor function for the annotation to look for.
     * @param inherit Indicates if base types should be checked as well. Default false.
     */
    hasAnnotation(annotationCtr: Constructor<any>, inherit?: boolean) : boolean {

        return this.getAnnotations(annotationCtr, inherit).length > 0;
    }

    /**
     * Returns true if the current type is a subtype of the specified type; otherwise, returns false.
     * @param type The [[Type]] or constructor function to check.
     */
    isSubtypeOf(type: Type | Constructor<any>): boolean {

        var isFunction = typeof type === "function";

        var baseType = this.baseType;
        while (baseType) {
            if (isFunction ? baseType.ctr === type : baseType === type) return true;
            baseType = baseType.baseType;
        }

        return false;
    }

    /**
     * Returns true if the current type can be assigned to the specified type; otherwise, return false.
     *
     * This happens if one of the two conditions are met:
     *  * The current type and the specified type are the same type.
     *  * The current type is a subtype of the specified type.
     *
     * @param type The [[Type]] or constructor function to check.
     */
    isAssignableTo(type: Type | Constructor<any>): boolean {

        if(typeof type === "function" ? this.ctr === type : this === type) return true;
        return this.isSubtypeOf(type);
    }

    /**
     * @hidden
     */
    private _properties: Property[];

    /**
     * A list of annotated properties for the type.
     */
    get properties(): Property[] {

        if(!this._properties) {
            this._properties = this._getPropertyNames().map(name => {
                return new Property(this._context, this, name);
            });
        }

        return this._properties;
    }

    /**
     * Returns the property with the specified name.
     * @param name The property name to find.
     */
    getProperty(name: string): Property {

        var properties = this.properties;
        for (var i = 0; i < properties.length; i++) {

            var property = properties[i];
            if (property.name == name) {
                return property;
            }
        }

        return null;
    }

    /**
     * @hidden
     */
    private _methods: Method[];

    /**
     * A list of methods for the type. Methods are available whether or not they are annotated.
     */
    get methods(): Method[] {

        if(!this._methods) {
            this._methods = this._getMethodNames().map(name => {
                return new Method(this._context, this, name);
            });
        }

        return this._methods;
    }

    /**
     * @hidden
     */
    private _baseType: Type;

    /**
     * The base type for the current type.
     */
    get baseType(): Type {

        if(this._baseType === undefined) {
            this._baseType = this._context.getType(this._getBaseType());
        }
        return this._baseType;
    }

    /**
     * Indicates if the type is the global Number type.
     */
    get isNumber(): boolean {

        return this.ctr === Number;
    }

    /**
     * Indicates if the type is the global String type.
     */
    get isString(): boolean {

        return this.ctr === String;
    }

    /**
     * Indicates if the type is the global Boolean type.
     */
    get isBoolean(): boolean {

        return this.ctr === Boolean;
    }

    /**
     * Indicates if the type is the global Array type.
     */
    get isArray(): boolean {

        return this.ctr === Array;
    }

    /**
     * Indicates if the type is the global Set type.
     */
    get isSet(): boolean {

        return this.ctr === Map;
    }

    /**
     * Indicates if the type is the global Function type.
     */
    get isFunction(): boolean {

        return this.ctr === Function;
    }

    /**
     * Indicates if the type is iterable (i.e. the type defines a method for Symbol.iterator).
     */
    get isIterable(): boolean {

        if (this.ctr == null || this.ctr.prototype == null) {
            return false;
        }
        return this.ctr.prototype[Symbol.iterator] !== undefined;
    }

    /**
     * Creates an instance of the type with the specified arguments.
     * @param args The arguments to pass to the constructor.
     * @returns An instance of the type.
     */
    createInstance(args?: any[]): any {

        if(!args) {
            return new this.ctr();
        }
        else {
            return new this.ctr(...args);
        }
    }

    /**
     * Gets the base type of the current type.
     * @hidden
     */
    private _getBaseType(): Constructor<any> {

        var basePrototype = this.ctr && this.ctr.prototype && Object.getPrototypeOf(this.ctr.prototype);
        return basePrototype && basePrototype.constructor;
    }

    /**
     * Gets a list of annotated properties for the type that are not methods.
     * @hidden
     */
    private _getPropertyNames(): string[] {

        var properties = Reflect.getOwnMetadata('propMetadata', this.ctr);
        if (properties) {
            return Object.getOwnPropertyNames(properties)
                .filter(p => isAccessor(this.ctr.prototype, p) || typeof this.ctr.prototype[p] !== "function");
        }

        return [];
    }

    /**
     * Gets a list of methods for the type.
     * @hidden
     */
    private _getMethodNames(): string[] {

        if(this.ctr) {
            return Object.getOwnPropertyNames(this.ctr.prototype)
                .filter(p => p != "constructor" && (isAccessor(this.ctr.prototype, p) ||  typeof this.ctr.prototype[p] === "function"));
        }

        return [];
    }

    /**
     * Gets a list of annotations for the type.
     * @hidden
     */
    private _getOwnMetadata(): any[] {

        return Reflect.getOwnMetadata('annotations', this.ctr) || [];
    }
}

function isAccessor(obj: any, p: string): boolean {

    var d = Object.getOwnPropertyDescriptor(obj, p);
    return !!(d && (d.get || d.set));
}