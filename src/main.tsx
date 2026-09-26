import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

import "@fontsource-variable/literata/opsz.css";
import "./styles.css";

createRoot(document.querySelector("#root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
