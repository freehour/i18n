export function isType(arg: unknown, type: string): boolean {
    return Object.prototype.toString.call(arg).includes(type, 8);
}

export function isFunction(arg: unknown): arg is (...args: any[]) => any {
    return isType(arg, 'Function');
}

export function isArray(arg: unknown): arg is any[] {
    return isType(arg, 'Array');
}

export function isObject(arg: unknown): arg is object {
    return isType(arg, 'Object');
}

export function isNumber(arg: unknown): arg is number {
    return isType(arg, 'Number');
}

export function isString(arg: unknown): arg is string {
    return isType(arg, 'String');
}

export function isBoolean(arg: unknown): arg is boolean {
    return isType(arg, 'Boolean');
}

export function isSymbol(arg: unknown): arg is symbol {
    return isType(arg, 'Symbol');
}

export function isBigInt(arg: unknown): arg is bigint {
    return isType(arg, 'BigInt');
}
