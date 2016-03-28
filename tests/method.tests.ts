import {assert} from "chai";
import {ClassWithoutDecorators} from "./fixtures/classWithoutDecorators";
import {ClassWithDecorators} from "./fixtures/classWithDecorators";
import {ReflectContext} from "../src/reflectContext";
import {ParentType, DerivedType, TestAnnotation} from "./fixtures/subtypes";

describe('Method', () => {

    var context = new ReflectContext();
    var typeWithoutDecorators = context.getType(ClassWithoutDecorators);
    var typeWithDecorators = context.getType(ClassWithDecorators);

    describe('parameters', () => {

        it('returns a list of method parameters for methods even if method is not decorated', () => {

            var method = typeWithoutDecorators.methods[0];
            assert.equal(method.name, "add");
            assert.equal(method.parameters.length, 2);
        });

        it("returns an empty list for a method that does not have any parameters", () => {

            var method = typeWithoutDecorators.methods[2];
            assert.equal(method.name, "something");
            assert.equal(method.parameters.length, 0);
        });
    });

});
