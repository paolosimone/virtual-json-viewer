import { App as LauncherApp } from "@/launcher/App";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root")!;
createRoot(root).render(<LauncherApp />);
