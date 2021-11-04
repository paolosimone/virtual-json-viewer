import { useMemo } from "react";
import { DefaultSettings, Settings } from "viewer/state";
import { useStorage } from ".";

const KEY = "settings";

export type DispatchSettings = (newSettings: Partial<Settings>) => void;

export function useSettings(): [Settings, DispatchSettings] {
  const [settings, setSettings] = useStorage<Settings>(KEY, DefaultSettings);

  const updateSettings = useMemo(
    () => (newSettings: Partial<Settings>) => {
      setSettings({ ...settings, ...newSettings });
    },
    [settings, setSettings]
  );

  return [settings, updateSettings];
}
