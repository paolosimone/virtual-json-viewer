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
 *
 * __Stringify__
 *
 * Unfortunately it's not so easy to make JSON.stringify sort keys,
 * so we rely on the external package `json-stable-stringify`.
 */

export type Root = Literal | Collection;
export type Literal = string | number | boolean | null;
export type Collection = Array | JObject;
export type Array = Root[];

// 'J' prefix to prevent collision with Object type
export type JObject = {
  content: ObjectContent;
  keys: string[];
  length: number;
};
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

export function isLeaf(json: Root): boolean {
  return isLiteral(json) || isEmpty(json);
}

/* Parsing / Serialization */

// see: https://jsonlines.org/
export type Lines = Root[];

export type TryParseOptions = {
  sortKeys?: boolean;
};

export function tryParseLines(
  text: string,
  opts?: TryParseOptions,
): Result<Lines> {
  text = cleanJsonText(text);

  const reviver = buildReviver(opts?.sortKeys || false);

  // try parsing the whole file as a single json...
  try {
    return [JSON.parse(text, reviver)];
  } catch (e) {
    // ...check if it's a newline-delimited json...
    try {
      return text.split("\n").map((line) => JSON.parse(line, reviver));
    } catch {
      // nope
    }

    // ...return the original error
    return e as Error;
  }
}

function cleanJsonText(text: string): string {
  text = removeXssiPrefix(text);
  text = text.trim();
  return text;
}

// Some servers include these prefixes in their JSON responses to protect from XSSI.
//
// The order of elements in this array is important.
// Only the first matching prefix will be removed.
const XSSI_JSON_PREFIXES = [
  // see: https://cs.opensource.google/angular/angular.js/+/master:src/ng/http.js;l=807-826;drc=71d19f120ab342a9e7cac64cf88b497ad5890de4
  ")]}',",
  // see: https://cs.opensource.google/gerrit/gerrit/gerrit/+/master:java/com/google/gerrit/httpd/restapi/RestApiServlet.java;l=219-231;drc=c8da485f48afd7ebf2c703b800ff3e3de5d086c8
  ")]}'",
];

function removeXssiPrefix(text: string): string {
  for (const prefix of XSSI_JSON_PREFIXES) {
    if (text.startsWith(prefix)) {
      return text.slice(prefix.length);
    }
  }
  return text;
}

export type ToStringOptions = {
  sortKeys?: boolean;
  space?: number;
};

export function linesToString(lines: Lines, opts?: ToStringOptions): string {
  return lines.map((line) => toString(line, opts)).join("\n");
}

export function toString(value: Root, opts?: ToStringOptions): string {
  return opts?.sortKeys
    ? stableStringify(value, {
        replacer,
        space: opts?.space,
        collapseEmpty: true,
      })!
    : JSON.stringify(value, replacer, opts?.space);
}

type ReviverInputValue = ObjectContent | Array | Literal;
type Reviver = (key: string, value: ReviverInputValue) => Root;

function buildReviver(sortKeys: boolean): Reviver {
  return function (_key: string, value: ReviverInputValue): Root {
    if (!isObjectContent(value)) {
      return value;
    }

    // Note: sorting doesn't affect performance because
    // Object.keys() is already O(NlogN) for large objects
    // Ref: https://stackoverflow.com/a/64912755
    const keys = Object.keys(value);
    if (sortKeys) keys.sort();

    return {
      content: value,
      keys: keys,
      length: keys.length,
    };
  };
}

function isObjectContent(json: ReviverInputValue): json is ObjectContent {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

// json-stable-stringify typing is useless
function replacer(_key: stableStringify.Key, value: unknown): unknown {
  const root = value as Root;
  return isObject(root) ? root.content : value;
}

/* Iteration */

export type Key = number | string;

export function* iterator(json: Root): Generator<[Key, Root]> {
  if (isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      yield [i, json[i]];
    }
  } else if (isObject(json)) {
    for (const key of json.keys) {
      yield [key, json.content[key]];
    }
  }
}
