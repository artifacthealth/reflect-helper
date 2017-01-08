import {assert} from "chai";
import {ReflectContext} from "../src/reflectContext";
import {ClassWithAccessors} from "./fixtures/classWithAccessors";

describe('Property', () => {

    var context = new ReflectContext();
    var typeWithAccessors = context.getType(ClassWithAccessors);

    describe('hasGetter', () => {

        it('returns true if the property has a getter', () => {

            assert.isTrue(typeWithAccessors.getProperty("prop1").hasGetter);
            assert.isTrue(typeWithAccessors.getProperty("prop3").hasGetter);
        });

        it('returns false if the property does not have a getter', () => {

            assert.isFalse(typeWithAccessors.getProperty("prop2").hasGetter);
            assert.isFalse(typeWithAccessors.getProperty("prop4").hasGetter);
        });
    });

    describe('hasSetter', () => {

        it('returns true if the property has a setter', () => {

            assert.isTrue(typeWithAccessors.getProperty("prop3").hasSetter);
            assert.isTrue(typeWithAccessors.getProperty("prop2").hasSetter);
        });

        it('returns false if the property does not have a setter', () => {

            assert.isFalse(typeWithAccessors.getProperty("prop1").hasSetter);
            assert.isFalse(typeWithAccessors.getProperty("prop4").hasSetter);
        });
    });

});
