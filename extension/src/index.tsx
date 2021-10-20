import React from "react";
import ReactDOM from "react-dom";
import { App as LauncherApp } from "./launcher/App";

ReactDOM.render(
  <React.StrictMode>
    <LauncherApp />
  </React.StrictMode>,
  document.getElementById("root")
);
