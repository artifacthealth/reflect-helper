import {makeDecorator} from "../../src/util";

// Define annotations
export class ContractAnnotation {

    constructor(public name?: string) {

    }
}

export class OperationAnnotation {

    constructor(public name?: string) {

    }
}

export class FieldAnnotation {

    constructor(public name?: string) {

    }
}

export interface ContractDecoratorFactory {

    (name?: string): ClassDecorator;
}

export interface OperationDecoratorFactory {

    (name?: string): PropertyDecorator;
}

export interface FieldDecoratorFactory {

    (name?: string): PropertyDecorator;
}

// Make decorators
export var Contract: ContractDecoratorFactory = makeDecorator(ContractAnnotation);
export var Operation: OperationDecoratorFactory = makeDecorator(OperationAnnotation);
export var Field: FieldDecoratorFactory = makeDecorator(FieldAnnotation);