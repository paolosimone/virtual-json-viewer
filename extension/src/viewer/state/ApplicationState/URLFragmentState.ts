import { Dispatch, useEffect, useState } from "react";
import { JQCommand } from "../JQCommand";
import { Search, SearchVisibility } from "../Search";
import { ViewerMode } from "../ViewerMode";

// All fields are optional because we don't have control over the URL fragment content.
export type URLFragmentState = {
  viewerMode?: ViewerMode;
  searchText?: Search["text"];
  searchVisibility?: Search["visibility"];
  searchCaseSensitive?: Search["caseSensitive"];
  searchStartingIndex?: number;
  jqFilter?: JQCommand["filter"];
  jqSlurp?: JQCommand["slurp"];
};

export function useURLFragmentState(): [
  URLFragmentState,
  Dispatch<URLFragmentState>,
] {
  const [fragmentState, setFragmentState] = useState<URLFragmentState>(() =>
    URLFragmentStateSerializer.deserialize(window.location.hash),
  );

  useEffect(() => {
    const newHash = URLFragmentStateSerializer.serialize(fragmentState);

    // Replace current history entry instead of adding a new one
    const url = new URL(window.location.href);
    url.hash = newHash;
    window.history.replaceState(null, "", url.toString());
  }, [fragmentState]);

  return [fragmentState, setFragmentState];
}

interface SerializerFor<T> {
  serialize(value: T): string;
  deserialize(text: string): T;
}

const URLFragmentStateSerializer: SerializerFor<URLFragmentState> = {
  serialize(value: URLFragmentState): string {
    const entries = Object.entries(value)
      .filter(([, value]) => value !== undefined)
      .map(([mapKey, value]) => {
        const key = mapKey as keyof URLFragmentState;
        const stringKey = URLKeySerializer.serialize(key);
        const serializer: SerializerFor<typeof value> = FIELD_SERIALIZERS[key];
        const stringValue = encodeURIComponent(serializer.serialize(value));
        return `${stringKey}=${stringValue}`;
      });

    return entries.join("&");
  },

  deserialize(text: string): URLFragmentState {
    text = (text.startsWith("#") ? text.substring(1) : text).trim();

    const state: URLFragmentState = {};

    if (text === "") {
      return state;
    }

    const entries = text.split("&").map((pair) => pair.split("="));

    for (const entry of entries) {
      // Unpack entry
      if (entry.length !== 2) {
        console.warn(`Invalid URL fragment entry:`, entry);
        continue;
      }
      const [stringKey, stringValue] = entry;

      // Parse and set key and value
      try {
        const key = URLKeySerializer.deserialize(stringKey);
        const serializer = FIELD_SERIALIZERS[key];
        const value = serializer.deserialize(decodeURIComponent(stringValue));
        (state as any)[key] = value;
      } catch (e) {
        console.warn(
          `Failed to deserialize URL fragment entry for key ${stringKey}:`,
          e,
        );
      }
    }

    return state;
  },
};

const URL_KEYS: Record<keyof URLFragmentState, string> = {
  viewerMode: "v",
  searchText: "s",
  searchVisibility: "sv",
  searchCaseSensitive: "sc",
  searchStartingIndex: "si",
  jqFilter: "jq",
  jqSlurp: "jqs",
};

const STATE_KEYS: Record<string, keyof URLFragmentState> = Object.fromEntries(
  Object.entries(URL_KEYS).map(([stateKey, urlKey]) => [urlKey, stateKey]),
) as Record<string, keyof URLFragmentState>;

const URLKeySerializer: SerializerFor<keyof URLFragmentState> = {
  serialize(value: keyof URLFragmentState): string {
    return URL_KEYS[value];
  },

  deserialize(text: string): keyof URLFragmentState {
    if (text in STATE_KEYS) {
      return STATE_KEYS[text];
    }
    throw new Error(`Unknown URL fragment key: ${text}`);
  },
};

const StringSerializer: SerializerFor<string> = {
  serialize(value: string): string {
    return value;
  },

  deserialize(text: string): string {
    return text;
  },
};

const BooleanSerializer: SerializerFor<boolean> = {
  serialize(value: boolean): string {
    return value ? "true" : "false";
  },

  deserialize(text: string): boolean {
    switch (text.toLowerCase()) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new Error(`Invalid boolean value: ${text}`);
    }
  },
};

const NumberSerializer: SerializerFor<number> = {
  serialize(value: number): string {
    return value.toString();
  },

  deserialize(text: string): number {
    const parsed = Number(text);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number value: ${text}`);
    }
    return parsed;
  },
};

class NullableSerializer<T> implements SerializerFor<Nullable<T>> {
  private innerSerializer: SerializerFor<T>;

  constructor(innerSerializer: SerializerFor<T>) {
    this.innerSerializer = innerSerializer;
  }

  serialize(value: Nullable<T>): string {
    if (value === null) {
      return "";
    }
    return this.innerSerializer.serialize(value);
  }

  deserialize(text: string): Nullable<T> {
    if (text === "") {
      return null;
    }
    return this.innerSerializer.deserialize(text);
  }
}

class EnumSerializer<T extends StringEnumType>
  implements SerializerFor<ValueOf<T>>
{
  private enumType: T;

  constructor(enumType: T) {
    this.enumType = enumType;
  }

  serialize(value: ValueOf<T>): string {
    return value;
  }

  deserialize(text: string): ValueOf<T> {
    if (Object.values(this.enumType).includes(text)) {
      return text as ValueOf<T>;
    }
    throw new Error(
      `Invalid enum value for enum ${this.enumType.constructor.name}: ${text}`,
    );
  }
}

type URLFragmentStateFieldsSerializer = {
  [K in keyof URLFragmentState]-?: SerializerFor<
    Exclude<URLFragmentState[K], undefined>
  >;
};

const FIELD_SERIALIZERS: URLFragmentStateFieldsSerializer = {
  viewerMode: new EnumSerializer(ViewerMode),
  searchText: StringSerializer,
  searchVisibility: new EnumSerializer(SearchVisibility),
  searchCaseSensitive: BooleanSerializer,
  searchStartingIndex: NumberSerializer,
  jqFilter: StringSerializer,
  jqSlurp: new NullableSerializer(BooleanSerializer),
};
