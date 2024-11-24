import { useMemo } from "react";
import { DefaultSettings, Settings, SETTINGS_KEY } from "viewer/state";
import { useStorage } from ".";

export type DispatchSettings = (newSettings: Partial<Settings>) => void;

export function useSettings(): [Settings, DispatchSettings] {
  const [settings, setSettings] = useStorage<Settings>(
    SETTINGS_KEY,
    DefaultSettings,
  );

  const upgraded = maybeUpgrade(settings);
  if (upgraded) {
    setSettings(upgraded);
  }

  const updateSettings = useMemo(
    () => (newSettings: Partial<Settings>) => {
      setSettings({ ...settings, ...newSettings });
    },
    [settings, setSettings],
  );

  return [settings, updateSettings];
}

function maybeUpgrade(settings: Settings): Nullable<Settings> {
  // changes in the same version are backward compatible
  if (isLatestVersion(settings) && hasMissingKeys(settings)) {
    return { ...DefaultSettings, ...settings };
  }

  // ...handle breaking changes

  // nothing to do
  return null;
}

function isLatestVersion(settings: Settings): boolean {
  return settings.version == DefaultSettings.version;
}

function hasMissingKeys(settings: Settings): boolean {
  return Object.keys(DefaultSettings).some((key: string) => !(key in settings));
}
