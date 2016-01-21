import "reflect-metadata";
import {Type} from "./type";
import {ReflectContext} from "./reflectContext";
import {matchingAnnotations, Constructor} from "./util";

/**
 * Information on a [[Type]] property.
 */
export class Property {

    /**
     * The [[Type]] that owns this property.
     */
    parent: Type;

    /**
     * The name of the property.
     */
    name: string;

    /**
     * Creates a [[Property]] object.
     * @param context The [[ReflectContext]] that is managing the [[Type]].
     * @param parent The [[Type]] that owns this property.
     * @param name The name of the property.
     * @hidden
     */
    constructor(protected context: ReflectContext, parent: Type, name: string) {

        if(!name) {
            throw new Error("Missing required argument 'name'.");
        }

        this.parent = parent;
        this.name = name;
    }

    /**
     * @hidden
     */
    private _type: Type;

    /**
     * The [[Type]] of the property. (Only available if the --emitDecoratorMetadata compiler option is enabled.)
     * @returns {Type}
     */
    get type(): Type {

        if(this._type === undefined) {
            this._type = this.context.getType(this._getPropertyType());
        }
        return this._type;
    }

    /**
     * Gets a list of annotations for the property.
     */
    getAnnotations(): any[];

    /**
     * Gets a list of the specified type of annotations for the property.
     * @param annotationCtr The constructor function used to filter the annotations.
     */
    getAnnotations<T>(annotationCtr: Constructor<T>) : T[];
    getAnnotations(annotationCtr?: any): any[] {

        return matchingAnnotations(annotationCtr, this._getOwnMetadata());
    }

    /**
     * Checks if the property has the specified type of annotation.
     * @param annotationCtr The constructor function for the annotation to look for.
     */
    hasAnnotation(annotationCtr: Constructor<any>) : boolean {

        return this.getAnnotations(annotationCtr).length > 0;
    }

    /**
     * Gets the value of the property on a target object.
     * @param obj The target object.
     */
    getValue(obj: Object): any {

        // Generate getters for VM optimization on first call to the getter. Verified that this improves performance
        // more than 3x for subsequent calls. We need to wait until the first call to generate the getter because
        // the 'flags' are not necessarily set in the constructor.
        // https://docs.google.com/document/d/10W46qDNO8Dl0Uye3QX0oUDPYAwaPl0qNy73TVLjd1WI/edit?pli=1#heading=h.rigwvvsmj92x
        this.getValue = <any>(new Function("o", "return o['" + this.name + "']"));

        return obj[this.name];
    }

    /**
     * Sets the value of the property on a target object.
     * @param obj The target object.
     * @param value The value to set.
     */
    setValue(obj: Object, value: any): void {

        // See comment in getValue. Verified performance improvement for setting a value as well, but for
        // setting we got almost a 10x performance improvement.
        this.setValue = <any>(new Function("o,v", "o['" + this.name + "'] = v"));

        obj[this.name] = value;
    }

    /**
     * @hidden
     */
    private _getOwnMetadata(): any[] {

        var properties = Reflect.getOwnMetadata('propMetadata', this.parent.ctr) || {};
        return properties[this.name] || [];
    }

    /**
     * @hidden
     */
    private _getPropertyType(): Constructor<any> {

        return Reflect.getMetadata('design:type', this.parent.ctr.prototype, this.name);
    }
}
