import React from "react";
import ReactDOM from "react-dom";
import { App as PopupApp } from "./popup/App";

ReactDOM.render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
  document.getElementById("root")
);
