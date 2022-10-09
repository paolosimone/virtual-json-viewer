import { useState } from "react";
import { EditCustomTheme } from "./EditCustomTheme";
import { MainOptions } from "./MainOptions";
import { OptionsPage } from "./Navigation";

export function App(): JSX.Element {
  // extremely basic navigation inside options page
  const [page, gotoPage] = useState(OptionsPage.Main);

  switch (page) {
    case OptionsPage.EditTheme:
      return <EditCustomTheme gotoPage={gotoPage} />;

    default:
      return <MainOptions gotoPage={gotoPage} />;
  }
}
