import "reflect-metadata";
import { Constructor } from "./constructor";

export function matchingAnnotations<T>(annotationCtr: Constructor<T>, annotations: any[]): T[] {

    if(annotationCtr) {
        annotations = annotations.filter(annotation => annotation instanceof <any>annotationCtr);
    }

    return annotations;
}

export function makeClassDecorator(annotationCtr: Constructor<any>) {

    return function DecoratorFactory(...args: any[]): ClassDecorator {

        var annotationInstance = new annotationCtr(...args);

        return function Decorator(target: Object): void {

            var annotations = Reflect.getOwnMetadata('annotations', target) || [];
            annotations.push(annotationInstance);
            Reflect.defineMetadata('annotations', annotations, target);
        }
    }
}

export function makePropertyDecorator(annotationCtr: Constructor<any>) {

    return function DecoratorFactory(...args: any[]): PropertyDecorator {

        var annotationInstance = new annotationCtr(...args);

        return function Decorator(target: Object, propertyName: string): void {

            var properties = Reflect.getOwnMetadata('propMetadata', target.constructor);
            properties = properties || {};
            properties[propertyName] = properties[propertyName] || [];
            properties[propertyName].push(annotationInstance);
            Reflect.defineMetadata('propMetadata', properties, target.constructor);
        }
    }
}

export interface PropertyDecorators {

    [x: string]: (PropertyDecorator | PropertyDecorator[]);
}

export function decorate(target: Constructor<any> | Function, decorators: ClassDecorator | ClassDecorator[], properties?: PropertyDecorators): void;
export function decorate(target: Constructor<any> | Function, properties: { [x: string]: (PropertyDecorator | PropertyDecorator[])}): void;
export function decorate(target: Constructor<any> | Function, decoratorsOrProperties: PropertyDecorators | ClassDecorator | ClassDecorator[], properties?: PropertyDecorators): void {

    var decorators: ClassDecorator[];

    if(Array.isArray(decoratorsOrProperties)) {
        decorators = decoratorsOrProperties;
    }
    else if(typeof decoratorsOrProperties === "function") {
        decorators = [<ClassDecorator>decoratorsOrProperties];
    }
    else if(typeof decoratorsOrProperties === "object") {
        properties = decoratorsOrProperties;
    }

    if(decorators) {
        Reflect.decorate(decorators, target);
    }

    if(properties) {
        for(var p in properties) {
            if(properties.hasOwnProperty(p)) {

                var propDecorators = properties[p];
                if(!Array.isArray(propDecorators)) {
                    propDecorators = [<PropertyDecorator>propDecorators];
                }

                if(target.prototype[p] === "function") {
                    Reflect.decorate(propDecorators, target.prototype, p, Object.getOwnPropertyDescriptor(target.prototype, p));
                }
                else {
                    Reflect.decorate(propDecorators, target.prototype, p);
                }
            }
        }
    }
}
