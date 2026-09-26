import { useReducer } from "react";

import { getDocx, getLesson, reviseLesson, updateLesson } from "../api/client";
import type { LessonWithIssues } from "../api/types";
import { cleanLesson, sectionNotes } from "../editor/edit";
import { EquipmentSheet } from "../editor/EquipmentSheet";
import { LessonHeader } from "../editor/LessonHeader";
import { ObjectivesSheet } from "../editor/ObjectivesSheet";
import { PartsSheet } from "../editor/PartsSheet";
import { editorReducer, initEditor } from "../editor/reducer";
import { ReviseSheet } from "../editor/ReviseSheet";
import { SaveBar } from "../editor/SaveBar";
import { isDirty, partNotes, toLesson } from "../editor/state";
import { ErrorText } from "../ErrorText";
import { useAction, useLeaveWarning, useLoad } from "../hooks";
import { Icon } from "../Icon";
import { listPath } from "../router";
import { saveFile } from "../saveFile";

/** Loads the lesson; render it with `key={id}` so another lesson starts from scratch. */
export function Editor({ id }: { id: string }) {
	const { data, error } = useLoad(() => getLesson(id));
	if (error) return <ErrorText>{error}</ErrorText>;
	if (!data) return <p className="muted">Загрузка…</p>;
	return <LessonEditor initial={data} />;
}

function LessonEditor({ initial }: { initial: LessonWithIssues }) {
	const [state, dispatch] = useReducer(editorReducer, initial, initEditor);
	const { busy, error, run } = useAction<"save" | "docx" | "revise">();
	const { fields, parts, issues, feedback } = state;
	const id = fields.id;
	const dirty = isDirty(state);

	useLeaveWarning(dirty);

	const save = () =>
		run("save", async () =>
			dispatch({ type: "saved", result: await updateLesson(cleanLesson(toLesson(state))) })
		);

	const revise = () =>
		run("revise", async () => {
			const result = await reviseLesson(id, {
				lesson: cleanLesson(toLesson(state)),
				feedback: feedback.trim(),
				sections: sectionNotes(partNotes(state)),
			});
			dispatch({ type: "revised", result });
		});

	async function download() {
		if (dirty && !(await save())) return;
		await run("docx", async () => {
			const { blob, filename } = await getDocx(id);
			saveFile(blob, filename);
		});
	}

	const hasRemarks = feedback.trim() !== "" || sectionNotes(partNotes(state)).length > 0;

	return (
		<>
			<a
				className="back"
				href={listPath}
			>
				<Icon name="left" /> Все конспекты
			</a>
			<LessonHeader
				fields={fields}
				issues={issues}
				dispatch={dispatch}
			/>
			<ObjectivesSheet
				objectives={fields.objectives}
				issues={issues}
				dispatch={dispatch}
			/>
			<EquipmentSheet
				equipment={fields.equipment}
				issues={issues}
				dispatch={dispatch}
			/>
			<PartsSheet
				parts={parts}
				issues={issues}
				dispatch={dispatch}
			/>
			<ReviseSheet
				feedback={feedback}
				hasRemarks={hasRemarks}
				canUndo={state.before !== null}
				disabled={busy !== null}
				revising={busy === "revise"}
				onRevise={revise}
				dispatch={dispatch}
			/>
			<SaveBar
				error={error}
				dirty={dirty}
				busy={busy}
				onSave={save}
				onDownload={download}
			/>
		</>
	);
}
