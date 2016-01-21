var reflect = require("reflect-helper");

// declare the EntityAnnotation and FieldAnnotation types
function EntityAnnotation(collection) {
    this.collection = collection;
}

function FieldAnnotation() {
}

// create decorators from the types
var Entity = reflect.makeDecorator(EntityAnnotation),
    Field = reflect.makeDecorator(FieldAnnotation);

// declare the Person type and decorate it using the Entity and Field decorators
function Person(age) {
    this.age = age;
}

reflect.decorate(Person, new Entity("people"), {
    age: Field()
});

// get metadata for the Person type
var personType = reflect.getType(Person);

console.log(personType.getAnnotations(EntityAnnotation)[0].collection);
console.log(personType.properties[0].name);