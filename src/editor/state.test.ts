import { describe, expect, it } from "vitest";
import type { Issue, Lesson, Section } from "../api/types";
import { editorReducer, initEditor, isDirty, toLesson, type EditorAction, type EditorState } from "./state";

const section = (title: string): Section => ({ kind: "game", title, paragraphs: ["x"] });

const lesson: Lesson = {
	id: "a".repeat(32),
	month: "Сентябрь",
	number: 5,
	topic: "Овощи",
	character: null,
	objectives: ["one"],
	equipment: [],
	sections: [section("A"), section("B"), section("C")],
};

const issue: Issue = { code: "x", severity: "error", message: "m", path: "sections[1].title" };

const apply = (state: EditorState, ...actions: EditorAction[]) => actions.reduce(editorReducer, state);
const start = () => initEditor({ lesson, issues: [issue] });
const titles = (state: EditorState) => state.parts.map((p) => p.section.title);

describe("parts", () => {
	it("move with their key and remark", () => {
		const state = apply(start(), { type: "noteChanged", index: 0, note: "проще" }, { type: "sectionMoved", index: 0, delta: 1 });
		expect(titles(state)).toEqual(["B", "A", "C"]);
		expect(state.parts.map((p) => p.key)).toEqual([1, 0, 2]);
		expect(state.parts[1]?.note).toBe("проще");
	});

	it("get fresh keys when added, never reusing a removed one", () => {
		const state = apply(start(), { type: "sectionRemoved", index: 2 }, { type: "sectionAdded" });
		expect(state.parts.map((p) => p.key)).toEqual([0, 1, 3]);
	});
});

describe("issues", () => {
	it("stay on text edits and go stale on structural ones", () => {
		expect(apply(start(), { type: "fieldsChanged", fields: { topic: "Фрукты" } }).issues).toEqual([issue]);
		expect(apply(start(), { type: "sectionMoved", index: 0, delta: 1 }).issues).toEqual([]);
		expect(apply(start(), { type: "objectiveAdded" }).issues).toEqual([]);
	});
});

it("tracks unsaved changes against the last save", () => {
	const edited = apply(start(), { type: "fieldsChanged", fields: { topic: "Фрукты" } });
	expect(isDirty(start())).toBe(false);
	expect(isDirty(edited)).toBe(true);
	const saved = apply(edited, { type: "saved", result: { lesson: toLesson(edited), issues: [] } });
	expect(isDirty(saved)).toBe(false);
});

it("keeps keys and remarks through a save", () => {
	const noted = apply(start(), { type: "noteChanged", index: 1, note: "короче" });
	const saved = apply(noted, { type: "saved", result: { lesson, issues: [] } });
	expect(saved.parts).toEqual(noted.parts);
});

it("clears remarks on a rewrite, which can be undone", () => {
	const noted = apply(
		start(),
		{ type: "noteChanged", index: 1, note: "короче" },
		{ type: "feedbackChanged", feedback: "проще" },
	);
	const rewritten = { ...lesson, sections: [section("D"), section("E")] };
	const revised = apply(noted, { type: "revised", result: { lesson: rewritten, issues: [issue] } });
	expect(titles(revised)).toEqual(["D", "E"]);
	expect(revised.parts.map((p) => p.note)).toEqual(["", ""]);
	expect(revised.feedback).toBe("");
	expect(isDirty(revised)).toBe(true);

	const undone = apply(revised, { type: "undone" });
	expect(undone.parts).toEqual(noted.parts);
	expect(undone.feedback).toBe("проще");
	expect(undone.issues).toEqual([]);
	expect(undone.before).toBeNull();
});
