import type { Dispatch } from "react";

import type { Issue } from "../api/types";
import { countBySeverity } from "./issues";
import { MonthSelect } from "./MonthSelect";
import type { EditorAction, EditorState } from "./state";

interface Props {
	fields: EditorState["fields"];
	issues: Issue[];
	dispatch: Dispatch<EditorAction>;
}

/** Month, number, topic and character, with the tally of issues across the lesson. */
export function LessonHeader({ fields, issues, dispatch }: Props) {
	const change = (patch: Partial<EditorState["fields"]>) =>
		dispatch({ type: "fieldsChanged", fields: patch });
	const { errors, warnings } = countBySeverity(issues);

	return (
		<section className="sheet">
			<h2>Конспект №{fields.number}</h2>
			<div className="row">
				<label>
					Месяц
					<MonthSelect
						value={fields.month}
						onChange={(month) => change({ month })}
					/>
				</label>
				<label>
					Номер
					<input
						type="number"
						min={1}
						value={fields.number}
						onChange={(e) => change({ number: Number(e.target.value) })}
					/>
				</label>
			</div>
			<label>
				Тема
				<input
					value={fields.topic}
					onChange={(e) => change({ topic: e.target.value })}
				/>
			</label>
			<label>
				Персонаж-сюрприз
				<input
					value={fields.character ?? ""}
					onChange={(e) => change({ character: e.target.value })}
				/>
			</label>
			{issues.length > 0 && (
				<p className="summary">
					Ошибок: {errors} · Предупреждений: {warnings}. Замечания показаны рядом с
					полями.
				</p>
			)}
		</section>
	);
}
