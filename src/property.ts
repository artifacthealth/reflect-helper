import "reflect-metadata";
import {Type} from "./type";
import {ReflectContext} from "./reflectContext";
import {Constructor} from "./constructor";
import {matchingAnnotations} from "./util";

export class Property {

    parent: Type;
    name: string;

    constructor(protected context: ReflectContext, parent: Type, name: string) {

        if(!name) {
            throw new Error("Missing required argument 'name'.");
        }

        this.parent = parent;
        this.name = name;
    }

    private _type: Type;

    get type(): Type {

        if(this._type === undefined) {
            this._type = this.context.getType(this._getPropertyType());
        }
        return this._type;
    }

    getAnnotations(): any[];
    getAnnotations<T>(annotationCtr: Constructor<T>) : T[];
    getAnnotations(annotationCtr?: any): any[] {

        return matchingAnnotations(annotationCtr, this._getOwnMetadata());
    }

    hasAnnotation(annotationCtr: Constructor<any>) : boolean {

        return this.getAnnotations(annotationCtr).length > 0;
    }

    getValue(obj: Object): any {

        // Generate getters for VM optimization on first call to the getter. Verified that this improves performance
        // more than 3x for subsequent calls. We need to wait until the first call to generate the getter because
        // the 'flags' are not necessarily set in the constructor.
        // https://docs.google.com/document/d/10W46qDNO8Dl0Uye3QX0oUDPYAwaPl0qNy73TVLjd1WI/edit?pli=1#heading=h.rigwvvsmj92x
        this.getValue = <any>(new Function("o", "return o['" + this.name + "']"));

        return obj[this.name];
    }

    setValue(obj: Object, value: any): void {

        // See comment in getValue. Verified performance improvement for setting a value as well, but for
        // setting we got almost a 10x performance improvement.
        this.setValue = <any>(new Function("o,v", "o['" + this.name + "'] = v"));

        obj[this.name] = value;
    }

    private _getOwnMetadata(): any[] {

        var properties = Reflect.getOwnMetadata('propMetadata', this.parent.ctr) || {};
        return properties[this.name] || [];
    }

    private _getPropertyType(): Constructor<any> {

        return Reflect.getMetadata('design:type', this.parent.ctr.prototype, this.name);
    }
}
