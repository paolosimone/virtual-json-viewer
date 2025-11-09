import { Dispatch, useEffect, useState } from "react";
import { JQCommand } from "../JQCommand";
import { Search, SearchVisibility } from "../Search";
import { ViewerMode } from "../ViewerMode";
import {
  BooleanSerializer,
  EnumSerializer,
  NullableSerializer,
  NumberSerializer,
  SerializerFor,
  StringSerializer,
} from "./URLFragmentSerializer";

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

export function useURLFragmentState(
  syncStateToURL: boolean,
): [URLFragmentState, Dispatch<URLFragmentState>] {
  // URL is parsed regardless of flag
  const [fragmentState, setFragmentState] = useState<URLFragmentState>(() =>
    URLFragmentStateSerializer.deserialize(window.location.hash),
  );

  useEffect(() => {
    // Cleanup URL hash if flag is disabled
    const newHash = syncStateToURL
      ? URLFragmentStateSerializer.serialize(fragmentState)
      : "";

    // Replace current history entry instead of adding a new one
    const url = new URL(window.location.href);
    url.hash = newHash;
    window.history.replaceState(null, "", url.toString());
  }, [syncStateToURL, fragmentState]);

  return [fragmentState, setFragmentState];
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
