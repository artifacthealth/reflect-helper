import {makeDecorator} from "../../src/util";


export class TestAnnotation {

    constructor(public value: string) {

    }
}

var Test: (value: string) => ClassDecorator = makeDecorator(TestAnnotation);

@Test("somevalue")
export class ParentType {

}

export class DerivedType extends ParentType {

}
