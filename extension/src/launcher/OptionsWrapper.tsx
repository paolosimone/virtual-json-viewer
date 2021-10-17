import { App as OptionsApp } from "../options/App";

export function OptionsWrapper(): JSX.Element {
  return (
    <div style={{ height: "600px", width: "900px" }}>
      <OptionsApp />
    </div>
  );
}
