import { useSyncExternalStore } from "react";

export type Route = { name: "list" } | { name: "lesson"; id: string };

const LESSON = /^#\/lessons\/([0-9a-f]{32})$/;

export function parseRoute(hash: string): Route {
	const id = LESSON.exec(hash)?.[1];
	return id ? { name: "lesson", id } : { name: "list" };
}

export const lessonPath = (id: string) => `#/lessons/${id}`;
export const listPath = "#/";

function subscribe(onChange: () => void): () => void {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
}

export function useHash(): string {
	return useSyncExternalStore(subscribe, () => window.location.hash);
}
