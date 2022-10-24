import stableStringify from "json-stable-stringify";
/**
 * Custom Json type
 *
 * It's basically the same as a normal Json except for the Object type,
 * which is wrapped in a custom `JObject` at deserialization time.
 *
 * __Keys order__
 *
 * From ECMAScript 2015 specification iteration over object keys
 * is guaranteed to happen in property creation order if all keys are string.
 * ... except that numeric string (e.g. "42") are treated as numbers :facepalm:
 *
 * So in order to avoid sorting keys any time we need to iterate over the object,
 * we trade time for space complexity and store the sorted keys array as metadata.
 *
 * __Object length__
 *
 * Counting the keys in a javascript object has linear complexity.
 * We store the key count as metadata as well, so that `Array` and `JObject`
 * have both the `length` field.
 *
 * __Why not Map?__
 *
 * Javascript also offers a Map type that seems to fit our use case, why not use it?
 * The drawback of building a Map on JSON.parse would be to convert it back
 * to an object on serialization, since JSON.stringify works only with objects.
 * In our use case JSON.parse is called rarely (on first load and when running JQ filtering),
 * while JSON.stringify could be called a lot of times, since it's the core routine of
 * the search functionality.
 *
 * Anyway, the data structure used as object is an internal detail of this module
 * and could be easily swapped whithout too much impact on the rest of the codebase.
 *
 * __Stringify__
 *
 * Unfortunately it's not so easy to make JSON.stringify sort keys,
 * so we rely on the external package `json-stable-stringify`.
 */

export type Root = Literal | Collection;
export type Literal = string | number | boolean | null;
export type Collection = JArray | JObject;

// 'J' prefix to prevent collision with native types
export type JArray = {
  type: "array";
  content: Root[];
  length: number;
  treeSize: number;
};
export type JObject = {
  type: "object";
  content: ObjectContent;
  keys: string[];
  length: number;
  treeSize: number;
};
export type ObjectContent = { [key: string]: Root };

/* Type predicates */

export function isObject(json: Root): json is JObject {
  return typeof json === "object" && json?.type === "object";
}

export function isArray(json: Root): json is JArray {
  return typeof json === "object" && json?.type === "array";
}

export function isCollection(json: Root): json is Collection {
  return isObject(json) || isArray(json);
}

export function isLiteral(json: Root): json is Literal {
  return !isCollection(json);
}

export function isString(value: Literal): value is string {
  return typeof value == "string";
}

export function isNumber(value: Literal): value is number {
  return typeof value == "number";
}

export function isBoolean(value: Literal): value is boolean {
  return typeof value == "boolean";
}

export function isNull(value: Literal): value is null {
  return value === null;
}

export function treeSize(json: Root): number {
  return isLiteral(json) ? 1 : json.treeSize;
}

export function isEmpty(json: Collection): boolean {
  return json.length === 0;
}

/* Parsing / Serialization */

export function tryParse(text: string): Result<Root> {
  try {
    return JSON.parse(text, reviver);
  } catch (e) {
    return e as Error;
  }
}

export type ToStringOptions = {
  sortKeys?: boolean;
  space?: number;
};

export function toString(value: Root, opts?: ToStringOptions): string {
  return opts?.sortKeys
    ? stableStringify(value, { replacer: replacer, space: opts?.space })
    : JSON.stringify(value, replacer, opts?.space);
}

type JsonIntermediateValue = ObjectContent | Root[] | Literal;

function reviver(_key: string, value: JsonIntermediateValue): Root {
  if (Array.isArray(value)) {
    const arraySize = value.reduce(
      (size: number, elem) => size + treeSize(elem),
      0
    );
    return {
      type: "array",
      content: value,
      length: value.length,
      treeSize: arraySize,
    };
  }

  if (isObjectContent(value)) {
    const sortedKeys = Object.keys(value).sort();
    const objectSize = Object.values(value).reduce(
      (size: number, elem) =>
        size + treeSize(elem) + Number(isCollection(elem)),
      0
    );

    return {
      type: "object",
      content: value,
      keys: sortedKeys,
      length: sortedKeys.length,
      treeSize: objectSize,
    };
  }

  // literal
  return value;
}

function isObjectContent(json: JsonIntermediateValue): json is ObjectContent {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

function replacer(_key: string, value: Root): JsonIntermediateValue {
  return isCollection(value) ? value.content : value;
}

/* Iteration */

export type Key = number | string;

export function* iterator(json: Root): Generator<[Key, Root], void, void> {
  if (isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      yield [i, json.content[i]];
    }
  } else if (isObject(json)) {
    for (const key of json.keys) {
      yield [key, json.content[key]];
    }
  }
}
