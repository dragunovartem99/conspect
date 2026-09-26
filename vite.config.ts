import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [svelte()],
	// Runes in tests run as in the browser, not as server-rendered.
	resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
	test: { environment: "node" },
});
