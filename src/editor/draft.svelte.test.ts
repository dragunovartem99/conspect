import { describe, expect, it } from "vitest";

import type { Issue, Lesson, Section } from "../api/types";
import { Draft } from "./draft.svelte";

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

const start = () => new Draft({ lesson, issues: [issue] });
const titles = (draft: Draft) => draft.parts.map((p) => p.section.title);
const keys = (draft: Draft) => draft.parts.map((p) => p.key);

describe("parts", () => {
	it("move with their key and remark", () => {
		const draft = start();
		draft.parts[0]!.note = "проще";
		draft.moveSection(0, 1);
		expect(titles(draft)).toEqual(["B", "A", "C"]);
		expect(keys(draft)).toEqual([1, 0, 2]);
		expect(draft.parts[1]?.note).toBe("проще");
	});

	it("get fresh keys when added, never reusing a removed one", () => {
		const draft = start();
		draft.removeSection(2);
		draft.addSection();
		expect(keys(draft)).toEqual([0, 1, 3]);
	});
});

describe("issues", () => {
	it("stay on text edits and go stale on structural ones", () => {
		const edited = start();
		edited.fields.topic = "Фрукты";
		expect(edited.issues).toEqual([issue]);

		const moved = start();
		moved.moveSection(0, 1);
		expect(moved.issues).toEqual([]);

		const added = start();
		added.addObjective();
		expect(added.issues).toEqual([]);
	});
});

it("tracks unsaved changes against the last save", () => {
	const draft = start();
	expect(draft.dirty).toBe(false);
	draft.fields.topic = "Фрукты";
	expect(draft.dirty).toBe(true);
	draft.saved({ lesson: draft.lesson, issues: [] });
	expect(draft.dirty).toBe(false);
});

it("keeps keys and remarks through a save", () => {
	const draft = start();
	draft.parts[1]!.note = "короче";
	const before = $state.snapshot(draft.parts);
	draft.saved({ lesson, issues: [] });
	expect(draft.parts).toEqual(before);
});

it("clears remarks on a rewrite, which can be undone", () => {
	const draft = start();
	draft.parts[1]!.note = "короче";
	draft.feedback = "проще";
	const noted = $state.snapshot(draft.parts);
	expect(draft.notes).toEqual([{ index: 1, text: "короче" }]);

	const rewritten = { ...lesson, sections: [section("D"), section("E")] };
	draft.revised({ lesson: rewritten, issues: [issue] });
	expect(titles(draft)).toEqual(["D", "E"]);
	expect(draft.parts.map((p) => p.note)).toEqual(["", ""]);
	expect(draft.feedback).toBe("");
	expect(draft.hasRemarks).toBe(false);
	expect(draft.dirty).toBe(true);

	draft.undo();
	expect(draft.parts).toEqual(noted);
	expect(draft.feedback).toBe("проще");
	expect(draft.issues).toEqual([]);
	expect(draft.before).toBeNull();
});
