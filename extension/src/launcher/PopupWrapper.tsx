import { App as PopupApp } from "../popup/App";

export function PopupWrapper(): JSX.Element {
  return (
    <div style={{ height: "600px", width: "900px" }}>
      <PopupApp />
    </div>
  );
}
