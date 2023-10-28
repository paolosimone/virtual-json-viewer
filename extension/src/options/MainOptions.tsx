import classNames from "classnames";
import { useContext } from "react";
import { SystemLanguage } from "viewer/localization";
import { DefaultSettings, DefaultTheme, TextSize } from "viewer/state";
import "../global.css";
import { GlobalOptionsContext, OptionsPage } from "./Context";
import {
  Checkbox,
  LanguageSelect,
  NumberInput,
  TextSizeSelect,
  ThemeSelect,
} from "./components";
import { NodeStateSelect } from "./components/NodeStateSelect";

export type MainOptionsProps = BaseProps;

export function MainOptions({ className }: MainOptionsProps): JSX.Element {
  const { gotoPage, t, setTheme, settings, updateSettings, setLanguage } =
    useContext(GlobalOptionsContext);

  return (
    <div
      className={classNames(
        "grid grid-cols-2 gap-3 items-center p-8",
        className,
      )}
    >
      <label>{t.settings.labels.theme}</label>
      <ThemeSelect onEdit={() => gotoPage(OptionsPage.EditTheme)} />

      <label>{t.settings.labels.language}</label>
      <LanguageSelect />

      <label>{t.settings.labels.textSize}</label>
      <TextSizeSelect
        textSize={settings.textSize}
        setTextSize={(newTextSize: TextSize) =>
          updateSettings({ textSize: newTextSize })
        }
      />

      <label>{t.settings.labels.indentation}</label>
      <NumberInput
        min={1}
        value={settings.indentation}
        setValue={(newValue: number) =>
          updateSettings({ indentation: newValue })
        }
      />

      <label>{t.settings.labels.searchDelay}</label>
      <NumberInput
        min={0}
        value={settings.searchDelay}
        setValue={(newValue: number) =>
          updateSettings({ searchDelay: newValue })
        }
      />

      <label>{t.settings.labels.defaultNodeState}</label>
      <NodeStateSelect
        expandNodes={settings.expandNodes}
        setExpandNodes={(newExpandNodes: boolean) =>
          updateSettings({ expandNodes: newExpandNodes })
        }
      />

      <label>{t.settings.labels.enableJQ}</label>
      <Checkbox
        checked={settings.enableJQ}
        setChecked={(checked: boolean) => updateSettings({ enableJQ: checked })}
      />

      <label>{t.settings.labels.linkifyUrls}</label>
      <Checkbox
        checked={settings.linkifyUrls}
        setChecked={(checked: boolean) =>
          updateSettings({ linkifyUrls: checked })
        }
      />

      <label>{t.settings.labels.sortKeys}</label>
      <Checkbox
        checked={settings.sortKeys}
        setChecked={(checked: boolean) => updateSettings({ sortKeys: checked })}
      />

      <div className="col-span-2 pt-2 flex flex-col place-items-center">
        <button
          className="p-2 red-alert rounded-lg hover:bg-opacity-80"
          onClick={() => {
            setTheme(DefaultTheme);
            setLanguage(SystemLanguage);
            updateSettings(DefaultSettings);
          }}
        >
          {t.settings.reset}
        </button>
      </div>
    </div>
  );
}
