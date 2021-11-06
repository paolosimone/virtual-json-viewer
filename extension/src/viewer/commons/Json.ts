/**
 * Custom Json type
 * 
 * It's basically the same as a normal Json except for the Object type,
 * which is wrapped in a custom `JObject` at deserialization time.
 * 
 * __Object length__
 * Counting the keys in a javascript object has linear complexity,
 * so it's computed one time on JSON.parse and stored as metadata.
 * 
 * __Keys order__
 * From ECMAScript 2015 specification iteration over object keys
 * is guaranteed to happen in property creation order, if all keys are string.
 * So we create a new object at load time inserting keys in ascending order.
 * 
 * Source: https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
 * 
 * __Why not Map?__
 * Javascript also offers a Map type that seems to fit our use case, why not use it? 
 * The drawback of building a Map on JSON.parse would be to convert it back
 * to an object on serialization, since JSON.stringify works only with objects.
 * In our use case JSON.parse is called rarely (on first load and when running JQ filtering),
 * while JSON.stringify could be called a lot of times, since it's the core routine of
 * the search functionality.
 * 
 * Anyway, the data structure used as object is an internal detail of this module
 * and could be easily swapped whithout too much impact on the rest of the codebase.
 */

export type Root = Literal | Collection;
export type Literal = string | number | boolean | null;
export type Collection = Array | JObject;
export type Array = Root[];

// 'J' prefix to prevent collision with Object type
export type JObject = { content: ObjectContent; length: number };
export type ObjectContent = { [key: string]: Root };

/* Type predicates */

export function isObject(json: Root): json is JObject {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

export function isArray(json: Root): json is Array {
  return Array.isArray(json);
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

export function length(json: Collection): number {
  return json.length;
}

export function isEmpty(json: Collection): boolean {
  return json.length === 0;
}

/* Parsing / Serialization */

export function tryParse(text: string, sortKeys?: boolean): Result<Root> {
  try {
    return JSON.parse(text, reviver(sortKeys));
  } catch (e) {
    return e as Error;
  }
}

export function toString(value: Root, space?: number): string {
  return JSON.stringify(value, replacer, space);
}

type ReviverInputValue = ObjectContent | Array | Literal;
type Reviver = (key: string, value: ReviverInputValue) => Root;

function reviver(sortKeys?: boolean): Reviver {
  return (_key, value) => {
    if (!isObjectContent(value)) {
      return value;
    }

    const keys = Object.keys(value);

    if (sortKeys) {
      const sortedValue: ObjectContent = {};
      for (const key of keys.sort()) {
        sortedValue[key] = value[key];
      }
      value = sortedValue;
    }

    return {
      content: value,
      length: keys.length,
    };
  };
}

function isObjectContent(json: ReviverInputValue): json is ObjectContent {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

type Json = Exclude<Root, JObject> | ObjectContent;

function replacer(_key: string, value: Root): Json {
  return isObject(value) ? value.content : value;
}

/* Iteration */

export function* iterator(json: Root): Generator<[string, Root], void, void> {
  if (isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      yield [i.toString(), json[i]];
    }
  } else if (isObject(json)) {
    for (const key of Object.getOwnPropertyNames(json.content)) {
      yield [key, json.content[key]];
    }
  }
}
