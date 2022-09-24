import { createRoot } from "react-dom/client";
import { App as OptionsApp } from "./options/App";

const root = document.getElementById("root");
createRoot(root!).render(<OptionsApp />);
