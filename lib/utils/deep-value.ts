import { isObject } from './is-type';

/**
 * Recursively retrieves a type from a nested object type using a path.
 *
 * @template T - The type of the object to retrieve the value type from.
 * @template P - The path to the value.
 * @template S - The separator used in the path (default is '.').
 */
export type DeepValue<T, P extends string, S extends string = '.'> =
  P extends `${infer Key}${S}${infer Rest}`
      ? Key extends keyof T
          ? DeepValue<T[Key], Rest, S>
          : never
      : P extends keyof T
          ? T[P]
          : never;


/**
 * Retrieves a value from a nested object using a path, returning `undefined` if the path is invalid.
 *
 * @template T - The type of the object to retrieve the value from.
 * @template P - The path to the value.
 * @template S - The separator used in the path (default is '.').
 *
 * @param obj The object to retrieve the value from.
 * @param path The path to the value.
 * @param separator The separator used in the path (default is '.').
 * @returns The value at the specified path, or `undefined` if the path is invalid.
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const value = getDeepValue(obj, 'a.b.c'); // 42 (type is number)
 *
 * const obj = { a: { b: [{ c: 42 }] } } as const;
 * const value = getDeepValue(obj, 'a.b.0.c'); // 42 (type is 42)
 */
export function getDeepValue<
    T extends Record<string, any>,
    P extends string,
    S extends string = '.',
>(
    obj: T,
    path: P,
    separator: S = '.' as S,
): DeepValue<T, P, S> | undefined {
    return path.split(separator).reduce(
        (acc: any, key) => isObject(acc) && key in acc
            ? acc[key as keyof typeof acc]
            : undefined,
        obj,
    );
}
