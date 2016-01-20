import "reflect-metadata";
import { Contract, Field, Operation } from "./decorators";
import { decorate } from "../../src/util";

export function ManualDecoration(name?: string) {

    this.name = name;
}

ManualDecoration.prototype.add = function(a: number, b: number): number {

    return a + b;
};

ManualDecoration.prototype.divide = function(a: number, b: number): number {

    return a / b;
}

decorate(ManualDecoration, Contract(), {
    name: Field(),
    add: Operation(),
    divide: Operation()
});
