import classNames from "classnames";
import { useContext } from "react";
import { SystemLanguage } from "viewer/localization";
import {
  DefaultSettings,
  DefaultTheme,
  SearchVisibility,
  TextSize,
  ViewerMode,
} from "viewer/state";
import "../global.css";
import { GlobalOptionsContext, OptionsPage } from "./Context";
import {
  Checkbox,
  EnumSelect,
  LanguageSelect,
  NumberInput,
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
        "grid grid-cols-2 gap-y-2 items-center px-8 py-4",
        className,
      )}
    >
      {/* SYSTEM */}
      <h2 className="col-span-2 text-center">{t.settings.sections.system}</h2>

      <label>{t.settings.labels.theme}</label>
      <ThemeSelect onEdit={() => gotoPage(OptionsPage.EditTheme)} />

      <label>{t.settings.labels.language}</label>
      <LanguageSelect />

      <label>{t.settings.labels.textSize}</label>
      <EnumSelect
        enumType={TextSize}
        value={settings.textSize}
        setValue={(newValue: TextSize) =>
          updateSettings({ textSize: newValue })
        }
        labels={t.settings.textSize}
      />

      {/* VIEWER */}
      <h2 className="col-span-2 text-center">{t.settings.sections.viewer}</h2>

      <label>{t.settings.labels.viewer}</label>
      <EnumSelect
        enumType={ViewerMode}
        value={settings.viewerMode}
        setValue={(newValue: ViewerMode) =>
          updateSettings({ viewerMode: newValue })
        }
        labels={t.toolbar.view}
      />

      <label>{t.settings.labels.viewerTreeNode}</label>
      <NodeStateSelect
        expandNodes={settings.expandNodes}
        setExpandNodes={(newExpandNodes: boolean) =>
          updateSettings({ expandNodes: newExpandNodes })
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

      <label>{t.settings.labels.sortKeys}</label>
      <Checkbox
        checked={settings.sortKeys}
        setChecked={(checked: boolean) => updateSettings({ sortKeys: checked })}
      />

      <label>{t.settings.labels.linkifyUrls}</label>
      <Checkbox
        checked={settings.linkifyUrls}
        setChecked={(checked: boolean) =>
          updateSettings({ linkifyUrls: checked })
        }
      />

      {/* TOOLBAR */}
      <h2 className="col-span-2 text-center">{t.settings.sections.toolbar}</h2>

      <label>{t.settings.labels.searchDelay}</label>
      <NumberInput
        min={0}
        value={settings.searchDelay}
        setValue={(newValue: number) =>
          updateSettings({ searchDelay: newValue })
        }
      />

      <label>{t.settings.labels.searchVisibility}</label>
      <EnumSelect
        enumType={SearchVisibility}
        value={settings.searchVisibility}
        setValue={(newValue: SearchVisibility) =>
          updateSettings({ searchVisibility: newValue })
        }
        labels={t.toolbar.search.visibility}
      />

      <label>{t.settings.labels.enableJQ}</label>
      <Checkbox
        checked={settings.enableJQ}
        setChecked={(checked: boolean) => updateSettings({ enableJQ: checked })}
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
