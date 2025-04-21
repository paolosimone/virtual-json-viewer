import "@/global.css";
import { SystemLanguage } from "@/viewer/localization";
import {
  DefaultSettings,
  DefaultTheme,
  SearchVisibility,
  TextSize,
  ViewerMode,
} from "@/viewer/state";
import classNames from "classnames";
import { JSX, useContext } from "react";
import { GlobalOptionsContext, OptionsPage } from "./Context";
import {
  Checkbox,
  EnumSelect,
  Label,
  LanguageSelect,
  NumberInput,
  ThemeSelect,
} from "./components";
import { ForceActivationSelect } from "./components/ForceActivationSelect";
import { NodeStateSelect } from "./components/NodeStateSelect";

export type MainOptionsProps = BaseProps;

export function MainOptions({ className }: MainOptionsProps): JSX.Element {
  const { gotoPage, t, setTheme, settings, updateSettings, setLanguage } =
    useContext(GlobalOptionsContext);

  return (
    <div
      className={classNames(
        "grid grid-cols-2 items-center gap-y-2 px-8 py-4",
        className,
      )}
    >
      {/* SYSTEM */}
      <h2 className="col-span-2 text-center font-semibold">
        {t.settings.sections.system}
      </h2>

      <Label tooltip="">{t.settings.labels.theme}</Label>
      <ThemeSelect onEdit={() => gotoPage(OptionsPage.EditTheme)} />

      <Label tooltip="">{t.settings.labels.language}</Label>
      <LanguageSelect />

      <Label tooltip="">{t.settings.labels.textSize}</Label>
      <EnumSelect
        enumType={TextSize}
        value={settings.textSize}
        setValue={(newValue: TextSize) =>
          updateSettings({ textSize: newValue })
        }
        labels={t.settings.textSize}
      />

      <Label tooltip="">{t.settings.labels.forceActivation}</Label>
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

      <Label tooltip="">{t.settings.labels.viewer}</Label>
      <EnumSelect
        enumType={ViewerMode}
        value={settings.viewerMode}
        setValue={(newValue: ViewerMode) =>
          updateSettings({ viewerMode: newValue })
        }
        labels={t.toolbar.view}
      />

      <Label tooltip="">{t.settings.labels.viewerTreeNode}</Label>
      <NodeStateSelect
        expandNodes={settings.expandNodes}
        setExpandNodes={(newExpandNodes: boolean) =>
          updateSettings({ expandNodes: newExpandNodes })
        }
      />

      <Label tooltip="">{t.settings.labels.indentation}</Label>
      <NumberInput
        min={1}
        value={settings.indentation}
        setValue={(newValue: number) =>
          updateSettings({ indentation: newValue })
        }
      />

      <Label tooltip="">{t.settings.labels.sortKeys}</Label>
      <Checkbox
        checked={settings.sortKeys}
        setChecked={(checked: boolean) => updateSettings({ sortKeys: checked })}
      />

      <Label tooltip="">{t.settings.labels.linkifyUrls}</Label>
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

      <Label tooltip="">{t.settings.labels.searchDelay}</Label>
      <NumberInput
        min={0}
        value={settings.searchDelay}
        setValue={(newValue: number) =>
          updateSettings({ searchDelay: newValue })
        }
      />

      <Label tooltip="">{t.settings.labels.searchVisibility}</Label>
      <EnumSelect
        enumType={SearchVisibility}
        value={settings.searchVisibility}
        setValue={(newValue: SearchVisibility) =>
          updateSettings({ searchVisibility: newValue })
        }
        labels={t.toolbar.search.visibility}
      />

      <Label tooltip="">{t.settings.labels.enableJQ}</Label>
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
        <LinkButton
          link={import.meta.env.VITE_STORE_LINK}
          emoji="&#128172;"
          label="Review"
        />
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
          className="red-alert hover:bg-opacity-80 rounded-lg p-2"
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
        "hover:border-viewer-foreground rounded-lg border border-transparent px-2 py-1",
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
