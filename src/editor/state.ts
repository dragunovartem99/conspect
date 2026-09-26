import type { Issue, Lesson, LessonWithIssues, Section } from "../api/types";
import { snapshot } from "./edit";

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

export interface EditorState extends Text {
	issues: Issue[];
	/** The lesson as last saved, as a snapshot, to tell whether there are unsaved changes. */
	saved: string;
	/** The text from before the last rewrite, so a bad rewrite can be undone. */
	before: Text | null;
	nextKey: number;
}

export type EditorAction =
	| { type: "saved"; result: LessonWithIssues }
	| { type: "revised"; result: LessonWithIssues }
	| { type: "undone" }
	| { type: "fieldsChanged"; fields: Partial<Fields> }
	| { type: "objectiveAdded" }
	| { type: "objectiveRemoved"; index: number }
	| { type: "sectionAdded" }
	| { type: "sectionChanged"; index: number; section: Section }
	| { type: "sectionMoved"; index: number; delta: -1 | 1 }
	| { type: "sectionRemoved"; index: number }
	| { type: "noteChanged"; index: number; note: string }
	| { type: "feedbackChanged"; feedback: string };

export const toLesson = ({ fields, parts }: EditorState): Lesson => ({
	...fields,
	sections: parts.map((part) => part.section),
});

export const isDirty = (state: EditorState): boolean => snapshot(toLesson(state)) !== state.saved;

export const partNotes = (state: EditorState): string[] => state.parts.map((part) => part.note);
