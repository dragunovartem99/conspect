import type { Issue, SectionKind } from "../api/types";

/** Issues reported for exactly this path, e.g. "objectives[1]" or "sections[3].title". */
export function issuesAt(issues: Issue[], path: string): Issue[] {
	return issues.filter((issue) => issue.path === path);
}

export function countBySeverity(issues: Issue[]): { errors: number; warnings: number } {
	const errors = issues.filter((i) => i.severity === "error").length;
	return { errors, warnings: issues.length - errors };
}

export const KIND_LABELS: Record<SectionKind, string> = {
	ritual: "Ритуал приветствия",
	surprise: "Сюрпризный момент",
	game: "Игра",
	physical_minute: "Физкультминутка",
	finger_gymnastics: "Пальчиковая гимнастика",
	classwork: "Классная работа",
	summary: "Итог занятия",
	reflection: "Рефлексия",
	other: "Другое",
};
