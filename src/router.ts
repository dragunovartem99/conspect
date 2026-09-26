export type Route = { name: "list" } | { name: "lesson"; id: string };

const LESSON = /^#\/lessons\/([0-9a-f]{32})$/u;

export function parseRoute(hash: string): Route {
	const id = LESSON.exec(hash)?.[1];
	return id ? { name: "lesson", id } : { name: "list" };
}

export const lessonPath = (id: string) => `#/lessons/${id}`;
export const listPath = "#/";
