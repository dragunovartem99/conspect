import { useEffect, useState, type FormEvent } from "react";
import { generateLesson } from "../api/client";
import { MONTHS } from "../editor/months";
import { lessonPath } from "../router";
import { message } from "./Login";

export function NewLessonForm({ nextNumber }: { nextNumber: number }) {
	const [month, setMonth] = useState(MONTHS[new Date().getMonth()] ?? "");
	const [number, setNumber] = useState(nextNumber);
	const [topic, setTopic] = useState("");
	const [character, setCharacter] = useState("");
	const [busy, setBusy] = useState(false);
	const [seconds, setSeconds] = useState(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => setNumber(nextNumber), [nextNumber]);

	useEffect(() => {
		if (!busy) return;
		setSeconds(0);
		const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
		return () => clearInterval(timer);
	}, [busy]);

	async function submit(event: FormEvent) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const result = await generateLesson({
				month,
				number,
				topic: topic.trim(),
				character: character.trim() || null,
			});
			window.location.hash = lessonPath(result.lesson.id);
		} catch (e) {
			setError(message(e));
			setBusy(false);
		}
	}

	return (
		<form className="sheet new-lesson" onSubmit={submit}>
			<h2>Новый конспект</h2>
			<fieldset disabled={busy}>
				<div className="row">
					<label>
						Месяц
						<select value={month} onChange={(e) => setMonth(e.target.value)}>
							{MONTHS.map((m) => (
								<option key={m}>{m}</option>
							))}
						</select>
					</label>
					<label>
						Номер занятия
						<input
							type="number"
							min={1}
							value={number}
							onChange={(e) => setNumber(Number(e.target.value))}
						/>
					</label>
				</div>
				<label>
					Тема
					<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Овощи" />
				</label>
				<label>
					Персонаж-сюрприз <span className="muted">(необязательно)</span>
					<input
						value={character}
						onChange={(e) => setCharacter(e.target.value)}
						placeholder="Если пусто, придумает нейросеть"
					/>
				</label>
			</fieldset>
			{error && <p className="error-text" role="alert">{error}</p>}
			<button className="primary" disabled={busy || !topic.trim() || number < 1}>
				{busy ? "Составляем конспект…" : "Составить конспект"}
			</button>
			{busy && (
				<div role="status" className="progress">
					<div className="bar" />
					<p className="muted">Это занимает от 30 до 90 секунд. Прошло: {seconds} с.</p>
				</div>
			)}
		</form>
	);
}
