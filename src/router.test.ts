import { expect, it } from "vitest";

import { lessonPath, parseRoute } from "./router";

const id = "0123456789abcdef0123456789abcdef";

it("parses a lesson route and round-trips lessonPath", () => {
	expect(parseRoute(lessonPath(id))).toEqual({ name: "lesson", id });
});

it("falls back to the list for anything else", () => {
	for (const hash of [
		"",
		"#/",
		"#/lessons/",
		"#/lessons/../etc",
		`#/lessons/${id}/x`,
		"#/lessons/XYZ",
	]) {
		expect(parseRoute(hash)).toEqual({ name: "list" });
	}
});
