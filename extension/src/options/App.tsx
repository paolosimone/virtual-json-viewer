import "tailwindcss/tailwind.css";
import { Theme } from "viewer/commons/state";
import { Select } from "viewer/components";
import { useTheme } from "viewer/hooks";

export function App(): JSX.Element {
  const [theme, setTheme] = useTheme();

  return (
    <div className="grid grid-cols-2 p-4 dark:bg-gray-700 dark:text-gray-200 text-base">
      <label>Theme </label>
      <span>
        <Select
          options={Object.values(Theme)}
          selected={theme}
          setValue={setTheme}
        />
      </span>
    </div>
  );
}
