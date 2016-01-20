export interface Constructor<T> extends Function {

    name?: string;
    new(...args: any[]): T;
}

export interface ParameterlessConstructor<T>  extends Function {

    name?: string;
    new(): T;
}
