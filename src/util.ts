// The code for makeDecorator is originally based on code from Angular 2.

import "reflect-metadata";

/**
 * Represents a constructor function for a concrete type.
 */
export interface Constructor<T> {

    /**
     * The name of the type.
     */
    name?: string;

    /**
     * Call signature for a constructor function.
     * @param args Arguments for the constructor.
     */
    new(...args: any[]): T;
}

/**
 * Returns the list of annotations that are an instance of the specified annotation type.
 * @param annotationCtr The constructor for the annotation
 * @param annotations A list of annotations to filter
 * @hidden
 */
export function matchingAnnotations<T>(annotationCtr: Constructor<T>, annotations: any[]): T[] {

    if(annotationCtr) {
        annotations = annotations.filter(annotation => annotation instanceof <any>annotationCtr);
    }

    return annotations;
}

/**
 * Makes a decorator factory from an annotation. The resulting decorator factory can be applied to a class or property.
 * @param annotationCtr The annotation constructor.
 *
 *
 * ### Example
 *
 * An annotation is just a class. So, supposed with have an annotation that marks a class as a persistent entity as
 * follows:
 *
 * ```typescript
 *  class EntityAnnotation {
 *
 *      constructor(public name?: string) {
 *      }
 *  }
 * ```
 *
 * We can turn that annotation into a class decorator. When applied, an instance of the annotation
 * is created and added to the 'annotations' metadata for the class. The parameters for the decorator will be the same
 * as the parameters for the class constructor. However, we may want to provide a type annotation for the decorator
 * factory because the parameters cannot be inferred.
 *
 * ```typescript
 *  var Entity: (name?: string) => ClassDecorator = makeDecorator(EntityAnnotation);
 * ```
 *
 * The Entity decorator can be applied as follows:
 * ```typescript
 *  @Entity()
 *  class Person {
 *
 *  }
 * ```
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

/**
 * A map of decorators to be applied to the properties of a type. The key is the name of the property and the value
 * is a decorator or an array of decorators.
 */
export interface PropertyDecorators {

    [x: string]: (PropertyDecorator | PropertyDecorator[]);
}

/**
 * A helper function to apply decorators in ES5.
 * @param target The constructor function or function that the decorators will be applied to.
 * @param decorators A decorator or array of decorators to apply to the type or function.
 * @param properties A map of decorators to be applied to the properties of a type. The key is the name of the property
 * and the value is a decorator or an array of decorators.
 *
 * ### Basic example
 *
 * Supposed with have a decorator factory, Entity, that marks a class as a persistent entity. We can apply the decorator
 * to our type as follows:
 * ```javascript
 * function Person(name) {
 *     this.name = name;
 * }
 *
 * decorate(Person, Entity());
 * ```
 *
 * An array of decorators can be applied to a type:
 * ```javascript
 * decorate(Person, [Entity(), Collection("people")]);
 * ```
 *
 *
 * ### Example with property decorators
 *
 * Suppose we have a decorator factory, Type, that gives the type of a field for a persistent entity. We can apply the
 * decorator to a property of our type as follows:
 * ```javascript
 * function Person(name) {
 *     this.name = name;
 * }
 *
 * decorate(Person, Entity(), {
 *     name: Type(String)
 * });
 * ```
 *
 * An array of decorators can be applied for a property:
 * ```javascript
 * decorate(Person, Entity(), {
 *     name: [Type(String), Field("n")]
 * });
 * ```
 */
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
