// The code for makeDecorator is originally based on code from Angular 2.

import "reflect-metadata";
import { Constructor } from "./constructor";

export function matchingAnnotations<T>(annotationCtr: Constructor<T>, annotations: any[]): T[] {

    if(annotationCtr) {
        annotations = annotations.filter(annotation => annotation instanceof <any>annotationCtr);
    }

    return annotations;
}

/**
 * Makes a decorator from an annotation. The resulting decorator can be applied to a class or property.
 * @param annotationCtr The annotation constructor.
 */
export function makeDecorator(annotationCtr: Constructor<any>) {

    return function DecoratorFactory(...args: any[]) {

        var annotationInstance = new annotationCtr(...args);

        return function Decorator(target: Object, propertyName?: string): void {

            if(propertyName) {
                var properties = Reflect.getOwnMetadata('propMetadata', target.constructor);
                properties = properties || {};
                properties[propertyName] = properties[propertyName] || [];
                properties[propertyName].push(annotationInstance);
                Reflect.defineMetadata('propMetadata', properties, target.constructor);
            }
            else {
                var annotations = Reflect.getOwnMetadata('annotations', target) || [];
                annotations.push(annotationInstance);
                Reflect.defineMetadata('annotations', annotations, target);
            }
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
    if(typeof decoratorsOrProperties === "object") {
        properties = <PropertyDecorators>decoratorsOrProperties;
    }
    else if(typeof decoratorsOrProperties === "function") {
        decorators = [<ClassDecorator>decoratorsOrProperties];
    }

    if(decorators) {
        Reflect.decorate(decorators, target);
    }

    if(properties) {
        for(var p in properties) {
            if(properties.hasOwnProperty(p)) {

                if(!Array.isArray(properties[p])) {
                    var propDecorators = [<PropertyDecorator>properties[p]];
                }
                else {
                    var propDecorators = <PropertyDecorator[]>properties[p];
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
