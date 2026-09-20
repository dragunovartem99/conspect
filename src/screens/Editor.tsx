import { useEffect, useState } from "react";
import { downloadDocx, getLesson, updateLesson } from "../api/client";
import type { Issue, Lesson } from "../api/types";
import { AutoTextarea } from "../editor/AutoTextarea";
import { cleanLesson, emptySection, moveItem, removeItem, replaceItem, snapshot } from "../editor/edit";
import { IssueList } from "../editor/IssueList";
import { countBySeverity, issuesAt } from "../editor/issues";
import { SectionCard } from "../editor/SectionCard";
import { listPath } from "../router";
import { message } from "./Login";

export function Editor({ id }: { id: string }) {
	const [lesson, setLesson] = useState<Lesson | null>(null);
	const [saved, setSaved] = useState("");
	const [issues, setIssues] = useState<Issue[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<"save" | "docx" | null>(null);

	function accept(result: { lesson: Lesson; issues: Issue[] }) {
		setLesson(result.lesson);
		setSaved(snapshot(result.lesson));
		setIssues(result.issues);
	}

	useEffect(() => {
		let cancelled = false;
		setLesson(null);
		setError(null);
		getLesson(id)
			.then((result) => !cancelled && accept(result))
			.catch((e) => !cancelled && setError(message(e)));
		return () => {
			cancelled = true;
		};
	}, [id]);

	const dirty = lesson !== null && snapshot(lesson) !== saved;

	useEffect(() => {
		if (!dirty) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	if (error && !lesson) return <p className="error-text" role="alert">{error}</p>;
	if (!lesson) return <p className="muted">Загрузка…</p>;

	/** Issue paths are positions, so adding, removing or moving parts makes them stale. */
	function edit(next: Lesson, structural = false) {
		setLesson(next);
		if (structural) setIssues([]);
	}

	async function save(): Promise<boolean> {
		if (!lesson) return false;
		setBusy("save");
		setError(null);
		try {
			accept(await updateLesson(cleanLesson(lesson)));
			return true;
		} catch (e) {
			setError(message(e));
			return false;
		} finally {
			setBusy(null);
		}
	}

	async function download() {
		if (dirty && !(await save())) return;
		setBusy("docx");
		try {
			await downloadDocx(id);
		} catch (e) {
			setError(message(e));
		} finally {
			setBusy(null);
		}
	}

	const { errors, warnings } = countBySeverity(issues);

	return (
		<>
			<a className="back" href={listPath}>
				← Все конспекты
			</a>

			<section className="sheet">
				<h2>Конспект №{lesson.number}</h2>
				<div className="row">
					<label>
						Месяц
						<input value={lesson.month} onChange={(e) => edit({ ...lesson, month: e.target.value })} />
					</label>
					<label>
						Номер
						<input
							type="number"
							min={1}
							value={lesson.number}
							onChange={(e) => edit({ ...lesson, number: Number(e.target.value) })}
						/>
					</label>
				</div>
				<label>
					Тема
					<input value={lesson.topic} onChange={(e) => edit({ ...lesson, topic: e.target.value })} />
				</label>
				<label>
					Персонаж-сюрприз
					<input
						value={lesson.character ?? ""}
						onChange={(e) => edit({ ...lesson, character: e.target.value })}
					/>
				</label>
				{issues.length > 0 && (
					<p className="summary">
						Ошибок: {errors} · Предупреждений: {warnings}. Замечания показаны рядом с полями.
					</p>
				)}
			</section>

			<section className="sheet">
				<h2>Программное содержание</h2>
				<IssueList issues={issuesAt(issues, "objectives")} />
				{lesson.objectives.map((objective, i) => (
					<div key={i}>
						<div className="objective">
							<span className="number">{i + 1}</span>
							<AutoTextarea
								aria-label={`Цель ${i + 1}`}
								rows={3}
								className={issuesAt(issues, `objectives[${i}]`).length ? "invalid" : ""}
								value={objective}
								onChange={(e) =>
									edit({ ...lesson, objectives: replaceItem(lesson.objectives, i, e.target.value) })
								}
							/>
							<button
								type="button"
								onClick={() => edit({ ...lesson, objectives: removeItem(lesson.objectives, i) }, true)}
							>
								Удалить
							</button>
						</div>
						<IssueList issues={issuesAt(issues, `objectives[${i}]`)} />
					</div>
				))}
				<button
					type="button"
					onClick={() => edit({ ...lesson, objectives: [...lesson.objectives, ""] }, true)}
				>
					+ Добавить цель
				</button>
			</section>

			<section className="sheet">
				<h2>Оборудование</h2>
				<AutoTextarea
					aria-label="Оборудование"
					rows={3}
					className={issuesAt(issues, "equipment").length ? "invalid" : ""}
					placeholder="Каждый предмет — с новой строки"
					value={lesson.equipment.join("\n")}
					onChange={(e) => edit({ ...lesson, equipment: e.target.value.split("\n") })}
				/>
				<IssueList issues={issuesAt(issues, "equipment")} />
			</section>

			<section className="sheet">
				<h2>Ход занятия</h2>
				<IssueList issues={issuesAt(issues, "sections")} />
				<ol className="cards">
					{lesson.sections.map((section, i) => (
						<SectionCard
							key={i}
							index={i}
							total={lesson.sections.length}
							section={section}
							issues={issues}
							onChange={(next) => edit({ ...lesson, sections: replaceItem(lesson.sections, i, next) })}
							onMove={(delta) => edit({ ...lesson, sections: moveItem(lesson.sections, i, delta) }, true)}
							onRemove={() => edit({ ...lesson, sections: removeItem(lesson.sections, i) }, true)}
						/>
					))}
				</ol>
				<button
					type="button"
					onClick={() => edit({ ...lesson, sections: [...lesson.sections, emptySection()] }, true)}
				>
					+ Добавить часть
				</button>
				<label className="check">
					<input
						type="checkbox"
						checked={lesson.include_farewell}
						onChange={(e) => edit({ ...lesson, include_farewell: e.target.checked })}
					/>
					Добавить прощальное стихотворение в конец занятия
				</label>
			</section>

			<div className="actions">
				<span className="status" role="status">
					{error ? <span className="error-text">{error}</span> : dirty ? "Есть несохранённые изменения" : "Сохранено"}
				</span>
				<button type="button" disabled={busy !== null || !dirty} onClick={save}>
					{busy === "save" ? "Сохраняем…" : "Сохранить"}
				</button>
				<button type="button" className="primary" disabled={busy !== null} onClick={download}>
					{busy === "docx" ? "Готовим файл…" : "Скачать .docx"}
				</button>
			</div>
		</>
	);
}
