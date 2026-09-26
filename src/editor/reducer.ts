import type { Lesson, LessonWithIssues } from "../api/types";
import { emptySection, moveItem, removeItem, replaceItem, snapshot } from "./edit";
import type { EditorAction, EditorState, Part } from "./state";

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
			return restructure(state, {
				fields: { ...fields, objectives: [...fields.objectives, ""] },
			});
		case "objectiveRemoved":
			return restructure(state, {
				fields: { ...fields, objectives: removeItem(fields.objectives, action.index) },
			});
		case "sectionAdded":
			return restructure(state, {
				parts: [...parts, { key: state.nextKey, section: emptySection(), note: "" }],
				nextKey: state.nextKey + 1,
			});
		case "sectionChanged":
			return {
				...state,
				parts: updatePart(parts, action.index, { section: action.section }),
			};
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
