import type { Lesson, Section } from "../api/types";

export function replaceItem<T>(list: T[], index: number, item: T): T[] {
	return list.map((old, i) => (i === index ? item : old));
}

export function removeItem<T>(list: T[], index: number): T[] {
	return list.filter((_, i) => i !== index);
}

export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
	const target = index + delta;
	const item = list[index];
	if (item === undefined || target < 0 || target >= list.length) return list;
	const moved = removeItem(list, index);
	moved.splice(target, 0, item);
	return moved;
}

export const emptySection = (): Section => ({ kind: "other", title: "", paragraphs: [""] });

/** What is sent to the server: stray blank lines and spaces from the textareas removed. */
export function cleanLesson(lesson: Lesson): Lesson {
	return {
		...lesson,
		character: lesson.character?.trim() || null,
		objectives: lesson.objectives.map((o) => o.trim()),
		equipment: lesson.equipment.map((e) => e.trim()).filter(Boolean),
		sections: lesson.sections.map((s) => ({
			...s,
			title: s.title.trim(),
			paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean),
		})),
	};
}

/** The non-blank per-part remarks in the shape the API takes. */
export const sectionNotes = (notes: string[]) =>
	notes.flatMap((text, index) => (text.trim() ? [{ index, text: text.trim() }] : []));

export const snapshot = (lesson: Lesson): string => JSON.stringify(cleanLesson(lesson));
