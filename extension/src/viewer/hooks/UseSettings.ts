import { DefaultSettings, Settings, SETTINGS_KEY } from "@/viewer/state";
import { useCallback } from "react";
import { useStorage } from ".";

export type DispatchSettings = (newSettings: Partial<Settings>) => void;

export function useSettings(): [Nullable<Settings>, DispatchSettings] {
  const [settings, setSettings] = useStorage<Settings>(
    SETTINGS_KEY,
    DefaultSettings,
  );

  // upgrade settings if an old version was stored
  if (settings) {
    const upgraded = maybeUpgrade(settings);
    if (!Object.is(settings, upgraded)) {
      setSettings(upgraded);
    }
  }

  const updateSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      if (!settings) return;
      setSettings({ ...settings, ...newSettings });
    },
    [settings, setSettings],
  );

  return [settings, updateSettings];
}

// returns a different Settings object in case of upgrade
function maybeUpgrade(settings: Settings): Settings {
  settings = addMissingKeys(settings);
  settings = upgradeV1toV2(settings);
  return settings;
}

// adding keys is always backward compatible
function addMissingKeys(settings: Settings): Settings {
  const hasMissingKeys = Object.keys(DefaultSettings).some(
    (key: string) => !(key in settings),
  );
  return hasMissingKeys ? { ...DefaultSettings, ...settings } : settings;
}

// V2: changed default value for activationUrlRegex
export function upgradeV1toV2(settings: Settings): Settings {
  if (settings.version > 1) {
    return settings;
  }

  settings = { ...settings, version: 2 };

  // don't overwrite regex if user already set a custom one
  settings.activationUrlRegex ??= "^.*(\\.jsonl?)$";

  return settings;
}
