import { Contract, Field, Operation } from "./decorators";

@Contract()
export class ClassWithDecorators {

    @Field()
    name: string;

    constructor(name?: string) {
        this.name = name;
    }

    @Operation()
    add(a: number, b: number): number {

        return a + b;
    }

    @Operation()
    divide(a: number, b: number): number {

        return a / b;
    }
}

