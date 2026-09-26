import type { Dispatch } from "react";

import { Progress } from "../Progress";
import { AutoTextarea } from "./AutoTextarea";
import type { EditorAction } from "./state";

interface Props {
	feedback: string;
	/** Whether there is anything to rewrite by: the general remark or a part's. */
	hasRemarks: boolean;
	canUndo: boolean;
	/** Another action is running, or this one. */
	disabled: boolean;
	revising: boolean;
	onRevise: () => void;
	dispatch: Dispatch<EditorAction>;
}

export function ReviseSheet(props: Props) {
	const { feedback, hasRemarks, canUndo, disabled, revising, onRevise, dispatch } = props;
	return (
		<section className="sheet">
			<h2>Поправить с помощью нейросети</h2>
			<p className="hint">
				Напишите, что изменить, — в общем поле или в отдельных частях («Что изменить в этой
				части»). Нейросеть перепишет конспект с учётом ваших правок и замечаний, остальное
				оставит как есть. Результат не сохранится, пока вы сами не нажмёте «Сохранить».
			</p>
			<AutoTextarea
				aria-label="Общее пожелание"
				rows={3}
				placeholder="Например: сделай слова проще и добавь ещё одну игру с мячом"
				value={feedback}
				disabled={disabled}
				onChange={(e) => dispatch({ type: "feedbackChanged", feedback: e.target.value })}
			/>
			<div className="row-actions">
				<button
					type="button"
					className="primary"
					disabled={disabled || !hasRemarks}
					onClick={onRevise}
				>
					{revising ? "Переписываем…" : "Переписать с учётом замечаний"}
				</button>
				{canUndo && (
					<button
						type="button"
						disabled={disabled}
						onClick={() => dispatch({ type: "undone" })}
					>
						Вернуть прежний текст
					</button>
				)}
			</div>
			{revising && <Progress />}
		</section>
	);
}
