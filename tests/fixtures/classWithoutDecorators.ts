export class ClassWithoutDecorators {

    name: string;

    constructor(name?: string) {
        this.name = name;
    }

    add(a: number, b: number): number {

        return a + b;
    }

    divide(a: number, b: number): number {

        return a / b;
    }
}