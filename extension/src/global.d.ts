// Handful common types
declare type Nullable<T> = T | null;
declare type Result<T> = T | Error;
declare type EmptyObject = Record<string, never>;
declare type Color = string;

// Add some common React props fields to T
declare type Props<T> = T & {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};
