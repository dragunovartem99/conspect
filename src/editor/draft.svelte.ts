import type { Issue, Lesson, LessonWithIssues, Section } from "../api/types";
import { emptySection, moveItem, removeItem, sectionNotes, snapshot } from "./edit";

type Fields = Omit<Lesson, "sections">;

/** A lesson part with what travels along with it: a stable key and the remark for the next rewrite. */
export interface Part {
	key: number;
	section: Section;
	note: string;
}

/** Everything the teacher types. */
interface Text {
	fields: Fields;
	parts: Part[];
	/** The remark for the whole lesson; per-part ones live in the parts. */
	feedback: string;
}

/** The lesson being edited. Text is edited in place; changes to its structure go through the methods. */
export class Draft implements Text {
	fields: Fields;
	parts: Part[] = $state([]);
	feedback = $state("");
	issues: Issue[] = $state([]);
	/** The text from before the last rewrite, so a bad rewrite can be undone. */
	before: Text | null = $state(null);
	/** The lesson as last saved, as a snapshot, to tell whether there are unsaved changes. */
	#saved = $state("");
	#nextKey = 0;

	dirty = $derived(snapshot(this.lesson) !== this.#saved);
	notes = $derived(sectionNotes(this.parts.map((part) => part.note)));
	hasRemarks = $derived(this.feedback.trim() !== "" || this.notes.length > 0);

	get lesson(): Lesson {
		return { ...this.fields, sections: this.parts.map((part) => part.section) };
	}

	constructor(result: LessonWithIssues) {
		const { sections: _, ...fields } = result.lesson;
		this.fields = $state(fields);
		this.saved(result);
	}

	saved(result: LessonWithIssues): void {
		this.#receive(result, true);
		this.#saved = snapshot(result.lesson);
	}

	/** Not saved: it shows as an unsaved change until the teacher accepts it. */
	revised(result: LessonWithIssues): void {
		this.before = $state.snapshot({
			fields: this.fields,
			parts: this.parts,
			feedback: this.feedback,
		});
		this.#receive(result, false);
		this.feedback = "";
	}

	undo(): void {
		const { before } = this;
		if (!before) return;
		this.#restructure(() => {
			({ fields: this.fields, parts: this.parts, feedback: this.feedback } = before);
			this.before = null;
		});
	}

	addObjective(): void {
		this.#restructure(() => this.fields.objectives.push(""));
	}

	removeObjective(index: number): void {
		this.#restructure(
			() => (this.fields.objectives = removeItem(this.fields.objectives, index))
		);
	}

	addSection(): void {
		this.#restructure(() =>
			this.parts.push({ key: this.#nextKey++, section: emptySection(), note: "" })
		);
	}

	moveSection(index: number, delta: -1 | 1): void {
		this.#restructure(() => (this.parts = moveItem(this.parts, index, delta)));
	}

	removeSection(index: number): void {
		this.#restructure(() => (this.parts = removeItem(this.parts, index)));
	}

	/** Takes in a lesson from the server. Parts keep their keys and, if asked, remarks by position. */
	#receive({ lesson, issues }: LessonWithIssues, keepNotes: boolean): void {
		const { sections, ...fields } = lesson;
		this.parts = sections.map((section, i) => {
			const old = this.parts[i];
			return {
				key: old?.key ?? this.#nextKey++,
				section,
				note: (keepNotes && old?.note) || "",
			};
		});
		this.fields = fields;
		this.issues = issues;
	}

	/** Issue paths are positions, so adding, removing or moving things makes them stale. */
	#restructure(change: () => void): void {
		change();
		this.issues = [];
	}
}
