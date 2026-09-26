import { mount } from "svelte";

import App from "./App.svelte";

import "@fontsource-variable/literata/opsz.css";
import "./styles.css";

mount(App, { target: document.querySelector("#app")! });
