import { createRoot } from "react-dom/client";
import { App as LauncherApp } from "@/launcher/App";

const root = document.getElementById("root")!;
createRoot(root).render(<LauncherApp />);
