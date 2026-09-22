import { describe, expect, it } from "vitest";
import type { Lesson } from "../api/types";
import { cleanLesson, moveItem, sectionNotes, removeItem, replaceItem, snapshot } from "./edit";

const lesson: Lesson = {
	id: "a".repeat(32),
	month: "Сентябрь",
	number: 5,
	topic: "Овощи",
	character: "  ",
	objectives: [" one ", "two"],
	equipment: ["a", "", "  ", "b "],
	sections: [{ kind: "game", title: " Игра ", paragraphs: ["x", "", "  y  ", ""] }],
};

describe("list helpers", () => {
	it("moves an item and leaves the original alone", () => {
		const list = [1, 2, 3];
		expect(moveItem(list, 2, -1)).toEqual([1, 3, 2]);
		expect(moveItem(list, 0, 1)).toEqual([2, 1, 3]);
		expect(list).toEqual([1, 2, 3]);
	});

	it("does not move past either end", () => {
		const list = [1, 2, 3];
		expect(moveItem(list, 0, -1)).toBe(list);
		expect(moveItem(list, 2, 1)).toBe(list);
	});

	it("replaces and removes by index", () => {
		expect(replaceItem([1, 2, 3], 1, 9)).toEqual([1, 9, 3]);
		expect(removeItem([1, 2, 3], 1)).toEqual([1, 3]);
	});
});

describe("cleanLesson", () => {
	const clean = cleanLesson(lesson);

	it("drops blank lines and trims text", () => {
		expect(clean.equipment).toEqual(["a", "b"]);
		expect(clean.sections[0]).toEqual({ kind: "game", title: "Игра", paragraphs: ["x", "y"] });
		expect(clean.objectives).toEqual(["one", "two"]);
	});

	it("turns an empty character into null", () => {
		expect(clean.character).toBeNull();
	});

	it("keeps empty objectives, so the server can report them", () => {
		expect(cleanLesson({ ...lesson, objectives: ["a", ""] }).objectives).toEqual(["a", ""]);
	});
});

describe("snapshot", () => {
	it("ignores whitespace-only edits, so they do not count as unsaved changes", () => {
		const padded = { ...lesson, equipment: [...lesson.equipment, "", ""] };
		expect(snapshot(padded)).toBe(snapshot(lesson));
	});

	it("changes when the text changes", () => {
		expect(snapshot({ ...lesson, topic: "Фрукты" })).not.toBe(snapshot(lesson));
	});
});

describe("sectionNotes", () => {
	it("keeps only non-blank remarks with their part position", () => {
		expect(sectionNotes(["", " проще ", "  ", "короче"])).toEqual([
			{ index: 1, text: "проще" },
			{ index: 3, text: "короче" },
		]);
	});
});
