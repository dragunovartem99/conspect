import type { Issue, Lesson, LessonWithIssues, Section } from "../api/types";
import { emptySection, moveItem, removeItem, replaceItem, snapshot } from "./edit";

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

/** Takes in a lesson from the server. Parts keep their keys and, if asked, remarks by position. */
function receive(state: EditorState, lesson: Lesson, keepNotes: boolean): EditorState {
	const { sections, ...fields } = lesson;
	let nextKey = state.nextKey;
	const parts = sections.map((section, i) => {
		const old = state.parts[i];
		return { key: old?.key ?? nextKey++, section, note: (keepNotes && old?.note) || "" };
	});
	return { ...state, fields, parts, nextKey };
}

/** Issue paths are positions, so adding, removing or moving things makes them stale. */
const restructure = (state: EditorState, change: Partial<EditorState>): EditorState => ({
	...state,
	...change,
	issues: [],
});

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
	const { fields, parts } = state;
	switch (action.type) {
		case "saved":
			return {
				...receive(state, action.result.lesson, true),
				issues: action.result.issues,
				saved: snapshot(action.result.lesson),
			};
		case "revised":
			// Not saved: it shows as an unsaved change until the teacher accepts it.
			return {
				...receive(state, action.result.lesson, false),
				issues: action.result.issues,
				feedback: "",
				before: { fields, parts, feedback: state.feedback },
			};
		case "undone":
			return state.before ? restructure(state, { ...state.before, before: null }) : state;
		case "fieldsChanged":
			return { ...state, fields: { ...fields, ...action.fields } };
		case "objectiveAdded":
			return restructure(state, { fields: { ...fields, objectives: [...fields.objectives, ""] } });
		case "objectiveRemoved":
			return restructure(state, { fields: { ...fields, objectives: removeItem(fields.objectives, action.index) } });
		case "sectionAdded":
			return restructure(state, {
				parts: [...parts, { key: state.nextKey, section: emptySection(), note: "" }],
				nextKey: state.nextKey + 1,
			});
		case "sectionChanged":
			return { ...state, parts: updatePart(parts, action.index, { section: action.section }) };
		case "sectionMoved":
			return restructure(state, { parts: moveItem(parts, action.index, action.delta) });
		case "sectionRemoved":
			return restructure(state, { parts: removeItem(parts, action.index) });
		case "noteChanged":
			return { ...state, parts: updatePart(parts, action.index, { note: action.note }) };
		case "feedbackChanged":
			return { ...state, feedback: action.feedback };
	}
}

function updatePart(parts: Part[], index: number, change: Partial<Part>): Part[] {
	const part = parts[index];
	return part ? replaceItem(parts, index, { ...part, ...change }) : parts;
}

export function initEditor(result: LessonWithIssues): EditorState {
	const empty: EditorState = {
		fields: { ...result.lesson },
		parts: [],
		feedback: "",
		issues: [],
		saved: "",
		before: null,
		nextKey: 0,
	};
	return editorReducer(empty, { type: "saved", result });
}
