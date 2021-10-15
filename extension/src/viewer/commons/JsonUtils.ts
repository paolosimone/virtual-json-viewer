export function isObject(json: Json): json is JsonObject {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

export function isArray(json: Json): json is JsonArray {
  return Array.isArray(json);
}

export function isCollection(json: Json): json is JsonCollection {
  return isObject(json) || isArray(json);
}

export function isLiteral(json: Json): json is JsonLiteral {
  return !isCollection(json);
}

export function isString(value: JsonLiteral): value is string {
  return typeof value == "string";
}

export function isNumber(value: JsonLiteral): value is number {
  return typeof value == "number";
}

export function isBoolean(value: JsonLiteral): value is boolean {
  return typeof value == "boolean";
}

export function isNull(value: JsonLiteral): value is null {
  return value === null;
}

export function length(json: JsonCollection): number {
  return Object.keys(json).length;
}

export function isEmpty(json: JsonCollection): boolean {
  return length(json) === 0;
}

export function* iterator(
  json: JsonCollection
): Generator<[string, Json], void, void> {
  if (isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      yield [i.toString(), json[i]];
    }
  } else if (isObject(json)) {
    for (let key in json) {
      yield [key, json[key]];
    }
  }
}
