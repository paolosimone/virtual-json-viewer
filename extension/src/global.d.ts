declare type Nullable<T> = T | null;

declare type Json = JsonLiteral | JsonCollection;
declare type JsonLiteral = string | number | boolean | null;
declare type JsonCollection = JsonObject | JsonArray;
declare type JsonObject = { [key: string]: Json };
declare type JsonArray = Json[];
