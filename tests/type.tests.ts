import {assert} from "chai";
import {ClassWithoutDecorators} from "./fixtures/classWithoutDecorators";
import {ClassWithDecorators} from "./fixtures/classWithDecorators";
import {ReflectContext} from "../src/reflectContext";

describe('Type', () => {

    var context = new ReflectContext();
    var typeWithoutDecorators = context.getType(ClassWithoutDecorators);
    var typeWithDecorators = context.getType(ClassWithDecorators);

    describe('methods', () => {

        it('gets a list of all methods on the prototype even if they are not annotated', () => {

            assert.equal(typeWithoutDecorators.methods.length, 2);
        });

        it('gets methods that are decorated or not and are functions', () => {

            assert.equal(typeWithDecorators.methods.length, 2);
        });
    });

    describe('properties', () => {

        it('does not get properties that are not annotated', () => {

            assert.equal(typeWithoutDecorators.properties.length, 0);
        });

        it('gets properties that are decorated and are not functions', () => {

            assert.equal(typeWithDecorators.properties.length, 1);
        });
    });
});
