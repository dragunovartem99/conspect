import { useEffect, useState } from "react";
import { deleteLesson, listLessons } from "../api/client";
import type { LessonSummary } from "../api/types";
import { lessonPath } from "../router";
import { NewLessonForm } from "./NewLessonForm";
import { message } from "./Login";

export function Lessons() {
	const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		listLessons()
			.then((list) => !cancelled && setLessons(list))
			.catch((e) => !cancelled && setError(message(e)));
		return () => {
			cancelled = true;
		};
	}, []);

	async function remove(lesson: LessonSummary) {
		if (!confirm(`Удалить конспект №${lesson.number} «${lesson.topic}»?`)) return;
		try {
			await deleteLesson(lesson.id);
			setLessons((list) => list?.filter((l) => l.id !== lesson.id) ?? null);
		} catch (e) {
			setError(message(e));
		}
	}

	const nextNumber = Math.max(0, ...(lessons ?? []).map((l) => l.number)) + 1;

	return (
		<>
			<NewLessonForm nextNumber={nextNumber} />
			<section className="sheet">
				<h2>Мои конспекты</h2>
				{error && <p className="error-text" role="alert">{error}</p>}
				{lessons === null && !error && <p className="muted">Загрузка…</p>}
				{lessons?.length === 0 && <p className="muted">Пока нет ни одного конспекта.</p>}
				<ul className="lessons">
					{lessons?.map((lesson) => (
						<li key={lesson.id}>
							<a href={lessonPath(lesson.id)}>
								<span className="lesson-number">№{lesson.number}</span> {lesson.topic}
							</a>
							<span className="muted">
								{lesson.created_at && new Date(lesson.created_at).toLocaleDateString("ru-RU")}
							</span>
							<button type="button" onClick={() => remove(lesson)}>
								Удалить
							</button>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
