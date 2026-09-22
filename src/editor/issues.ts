import type { Issue } from "../api/types";

/** Issues reported for exactly this path, e.g. "objectives[1]" or "sections[3].title". */
export function issuesAt(issues: Issue[], path: string): Issue[] {
	return issues.filter((issue) => issue.path === path);
}

export function countBySeverity(issues: Issue[]): { errors: number; warnings: number } {
	const errors = issues.filter((i) => i.severity === "error").length;
	return { errors, warnings: issues.length - errors };
}
