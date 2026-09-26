import { useState } from "react";

import { deleteLesson, listLessons, message } from "../api/client";
import type { LessonSummary } from "../api/types";
import { ErrorText } from "../ErrorText";
import { useLoad } from "../hooks";
import { lessonPath } from "../router";
import { NewLessonForm } from "./NewLessonForm";

export function Lessons() {
	const { data: lessons, setData: setLessons, error: loadError } = useLoad(listLessons);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const error = loadError ?? deleteError;

	async function remove(lesson: LessonSummary) {
		if (!confirm(`Удалить конспект №${lesson.number} «${lesson.topic}»?`)) return;
		try {
			await deleteLesson(lesson.id);
			setLessons((list) => list?.filter((l) => l.id !== lesson.id) ?? null);
		} catch (e) {
			setDeleteError(message(e));
		}
	}

	const nextNumber = Math.max(0, ...(lessons ?? []).map((l) => l.number)) + 1;

	return (
		<>
			<NewLessonForm nextNumber={nextNumber} />
			<section className="sheet">
				<h2>Мои конспекты</h2>
				{error && <ErrorText>{error}</ErrorText>}
				{lessons === null && !error && <p className="muted">Загрузка…</p>}
				{lessons?.length === 0 && <p className="muted">Пока нет ни одного конспекта.</p>}
				<ul className="lessons">
					{lessons?.map((lesson) => (
						<li key={lesson.id}>
							<a href={lessonPath(lesson.id)}>
								<span className="lesson-number">№{lesson.number}</span>{" "}
								{lesson.topic}
							</a>
							<span className="muted">
								{lesson.created_at &&
									new Date(lesson.created_at).toLocaleDateString("ru-RU")}
							</span>
							<button
								type="button"
								onClick={() => remove(lesson)}
							>
								Удалить
							</button>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
