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
import { ForceActivationSelect } from "./components/ForceActivationSelect";

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
      <h2 className="col-span-2 text-center font-semibold">
        {t.settings.sections.system}
      </h2>

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

      <label>{t.settings.labels.forceActivation}</label>
      <ForceActivationSelect
        urlRegex={settings.activationUrlRegex}
        setUrlRegex={(newValue: Nullable<string>) =>
          updateSettings({ activationUrlRegex: newValue })
        }
      />

      {/* VIEWER */}
      <h2 className="col-span-2 text-center font-semibold">
        {t.settings.sections.viewer}
      </h2>

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
      <h2 className="col-span-2 text-center font-semibold">
        {t.settings.sections.toolbar}
      </h2>

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

      {/* SUPPORT */}
      <h2 className="col-span-2 text-center font-semibold">
        {t.settings.sections.support}
      </h2>
      <div className="col-span-2 flex justify-around">
        <LinkButton
          link="https://github.com/paolosimone/virtual-json-viewer"
          emoji="&#11088;"
          label="Github"
        />
        <LinkButton link="${STORE_LINK}" emoji="&#128172;" label="Review" />
        <LinkButton
          link="https://github.com/paolosimone/virtual-json-viewer#keyboard-shortcuts"
          emoji="&#9000;"
          label="Shortcuts"
        />
        <LinkButton
          link="https://github.com/paolosimone/virtual-json-viewer/issues"
          emoji="&#128030;"
          label="Bugs"
        />
      </div>

      {/* RESET */}
      <div className="col-span-2 mt-4 flex flex-col place-items-center">
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

type LinkButtonProps = Props<{
  link: string;
  label: string;
  emoji: string;
}>;

function LinkButton({
  link,
  label,
  emoji,
  className,
}: LinkButtonProps): JSX.Element {
  return (
    <a
      className={classNames(
        "border border-transparent hover:border-viewer-foreground rounded-lg py-1 px-2",
        className,
      )}
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      <span>{emoji}</span>
      <span> </span>
      <span className="underline">{label}</span>
    </a>
  );
}
