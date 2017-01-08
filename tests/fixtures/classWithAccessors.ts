import { Contract, Field, Operation } from "./decorators";

@Contract()
export class ClassWithAccessors {

    private _prop2: number;
    private _prop3: number;

    @Field()
    get prop1(): number {

        return 1;
    }

    @Field()
    set prop2(value: number) {

        this._prop2 = value;
    }

    @Field()
    get prop3(): number {

        return this._prop3;
    }

    set prop3(value: number) {

        this._prop3 = value;
    }

    @Field()
    prop4: number;
}