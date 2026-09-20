import { expect, it } from "vitest";
import type { Issue } from "../api/types";
import { countBySeverity, issuesAt } from "./issues";

const issue = (path: string, severity: Issue["severity"] = "error"): Issue => ({
	code: "x",
	severity,
	message: "m",
	path,
});

it("finds issues by exact path", () => {
	const issues = [issue("objectives"), issue("objectives[1]"), issue("sections[1].title")];
	expect(issuesAt(issues, "objectives[1]")).toEqual([issues[1]]);
	expect(issuesAt(issues, "objectives")).toEqual([issues[0]]);
	expect(issuesAt(issues, "sections[1]")).toEqual([]);
});

it("counts errors and warnings", () => {
	const issues = [issue("a"), issue("b"), issue("c", "warning")];
	expect(countBySeverity(issues)).toEqual({ errors: 2, warnings: 1 });
});
