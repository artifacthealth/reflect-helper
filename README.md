This module is a utility library for working with Angular2-style annotations and type information provided by 
the TypeScript --emitDecoratorMetadata compiler option. An annotation is a class that can be added as metadata on a 
type, property, method, or parameter. API documentation is available [here](http://artifacthealth.github.io/reflect-helper).


## Usage 
 
Suppose you have a class, EntityAnnotation, that can be used to flag a type as a persistent entity. The 
annotation can optionally specify the name of the entity. You can create this annotation in TypeScript as follows:

```typescript
 class EntityAnnotation {

     constructor(public name?: string) {
     }
 }
```

To be able to apply the annotation to a class, we must first turn it into a decorator factory. We can do this using
the [makeDecorator](http://artifacthealth.github.io/reflect-helper/globals.html#makedecorator) function. When the
decorator is applied to a class, an instance of the annotation is created and added to the 'annotations' metadata for 
the class.

The parameters for the decorator factory will be the same as the parameters for the class constructor.

```typescript
 import { makeDecorator } from "reflect-helper";
 
 var Entity = makeDecorator(EntityAnnotation);
```

The Entity decorator can be applied to the class as demonstrated below. In this example we also apply a property 
decorator called Field:

```typescript
 @Entity("person")
 class Person {
 
     @Field()
     age: number;

     constructor(age: number) {
         this.age = age;
     }
 }
```

If not using a transpiler, such as TypeScript or Babel, that supports decorators, we can instead apply the decorator 
using a helper function called [decorate](http://artifacthealth.github.io/reflect-helper/globals.html#decorate) as
follows: 

```javascript
var decorate = require("reflect-helper").decorate;

function Person(age) {
    this.age = age;
}

decorate(Person, Entity("person"), {
    age: Field()
});
```

Now at a later point in our program we want to check if the Person class is annotated with EntityAnnotation. We can do
this using the [getType](http://artifacthealth.github.io/reflect-helper/globals.html#gettype) function.

```typescript
import { getType } from "reflect-helper";

var personType = getType(Person);

console.log(personType.hasAnnotation(EntityAnnotation)); // true
console.log(personType.getAnnotations(EntityAnnotation)[0].name); // person
```

Let's say we want to get the name and type of the first annotated property on the Person class:

```typescript
var property = personType.properties[0];

console.log(property.name); // age
console.log(property.type.name); // Number 
```

Note that only properties that have an annotation are available in the 
[[properties]](http://artifacthealth.github.io/reflect-helper/classes/type.html#properties) array on the 
[Type](http://artifacthealth.github.io/reflect-helper/classes/type.html) class. Also, the type of the property is only
available if the --emitDecoratorMetadata compiler option is enabled in TypeScript.
