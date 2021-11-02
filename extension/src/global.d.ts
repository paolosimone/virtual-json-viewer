// Handful common types
declare type Nullable<T> = T | null;
declare type Result<T> = T | Error;
declare type EmptyObject = Record<string, never>;
declare type Color = string;

// Json recursive definition
declare type Json = JsonLiteral | JsonCollection;
declare type JsonLiteral = string | number | boolean | null;
declare type JsonCollection = JsonObject | JsonArray;
declare type JsonObject = { [key: string]: Json };
declare type JsonArray = Json[];

// Add some common React props fields to T
declare type Props<T> = T & {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};
