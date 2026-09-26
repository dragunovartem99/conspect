import { useState } from "react";
import type { FormEvent } from "react";

import { generateLesson } from "../api/client";
import { AutoTextarea } from "../editor/AutoTextarea";
import { MONTHS } from "../editor/labels";
import { MonthSelect } from "../editor/MonthSelect";
import { ErrorText } from "../ErrorText";
import { useAction } from "../hooks";
import { Progress } from "../Progress";
import { lessonPath } from "../router";

export function NewLessonForm({ nextNumber }: { nextNumber: number }) {
	const [month, setMonth] = useState(MONTHS[new Date().getMonth()] ?? "");
	/** Null until the teacher types a number: until then it follows the suggested one. */
	const [typedNumber, setTypedNumber] = useState<number | null>(null);
	const [topic, setTopic] = useState("");
	const [character, setCharacter] = useState("");
	const [brief, setBrief] = useState("");
	const { busy, error, run } = useAction<"generate">();
	const number = typedNumber ?? nextNumber;

	function submit(event: FormEvent) {
		event.preventDefault();
		void run(
			"generate",
			async () => {
				const result = await generateLesson({
					month,
					number,
					topic: topic.trim(),
					character: character.trim() || null,
					brief: brief.trim() || null,
				});
				window.location.hash = lessonPath(result.lesson.id);
			},
			{ leaves: true }
		);
	}

	return (
		<form
			className="sheet new-lesson"
			onSubmit={submit}
		>
			<h2>Новый конспект</h2>
			<fieldset disabled={busy !== null}>
				<div className="row">
					<label>
						Месяц
						<MonthSelect
							value={month}
							onChange={setMonth}
						/>
					</label>
					<label>
						Номер занятия
						<input
							type="number"
							min={1}
							value={number}
							onChange={(e) => setTypedNumber(Number(e.target.value))}
						/>
					</label>
				</div>
				<label>
					Тема
					<input
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
						placeholder="Овощи"
					/>
				</label>
				<label>
					Персонаж-сюрприз <span className="muted">(необязательно)</span>
					<input
						value={character}
						onChange={(e) => setCharacter(e.target.value)}
						placeholder="Если пусто, придумает нейросеть"
					/>
				</label>
				<label>
					Техническое задание <span className="muted">(необязательно)</span>
					<AutoTextarea
						rows={3}
						value={brief}
						onChange={(e) => setBrief(e.target.value)}
						placeholder="Что обязательно должно быть в конспекте: игры, загадки, задания, чего избегать"
					/>
				</label>
			</fieldset>
			{error && <ErrorText>{error}</ErrorText>}
			<button
				className="primary"
				disabled={busy !== null || !topic.trim() || number < 1}
			>
				{busy ? "Составляем конспект…" : "Составить конспект"}
			</button>
			{busy && <Progress showElapsed />}
		</form>
	);
}
