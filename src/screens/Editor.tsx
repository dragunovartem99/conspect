import { useEffect, useReducer } from "react";
import { getDocx, getLesson, reviseLesson, updateLesson } from "../api/client";
import type { LessonWithIssues } from "../api/types";
import { AutoTextarea } from "../editor/AutoTextarea";
import { cleanLesson, replaceItem, sectionNotes } from "../editor/edit";
import { IssueList } from "../editor/IssueList";
import { countBySeverity, issuesAt } from "../editor/issues";
import { MONTHS } from "../editor/labels";
import { LinesTextarea } from "../editor/LinesTextarea";
import { SectionCard } from "../editor/SectionCard";
import { editorReducer, initEditor, isDirty, partNotes, toLesson } from "../editor/state";
import { useAction, useLoad } from "../hooks";
import { Icon } from "../Icon";
import { Progress } from "../Progress";
import { listPath } from "../router";
import { saveFile } from "../saveFile";

/** Loads the lesson; render it with `key={id}` so another lesson starts from scratch. */
export function Editor({ id }: { id: string }) {
	const { data, error } = useLoad(() => getLesson(id));
	if (error) return <p className="error-text" role="alert">{error}</p>;
	if (!data) return <p className="muted">Загрузка…</p>;
	return <LessonEditor initial={data} />;
}

function LessonEditor({ initial }: { initial: LessonWithIssues }) {
	const [state, dispatch] = useReducer(editorReducer, initial, initEditor);
	const { busy, error, run } = useAction<"save" | "docx" | "revise">();
	const { fields, parts, issues, feedback } = state;
	const id = fields.id;
	const dirty = isDirty(state);

	useEffect(() => {
		if (!dirty) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	const save = () =>
		run("save", async () => dispatch({ type: "saved", result: await updateLesson(cleanLesson(toLesson(state))) }));

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

	const { errors, warnings } = countBySeverity(issues);
	const equipmentIssues = issuesAt(issues, "equipment");
	const hasRemarks = feedback.trim() !== "" || sectionNotes(partNotes(state)).length > 0;

	return (
		<>
			<a className="back" href={listPath}>
				<Icon name="left" /> Все конспекты
			</a>

			<section className="sheet">
				<h2>Конспект №{fields.number}</h2>
				<div className="row">
					<label>
						Месяц
						<select
							value={fields.month}
							onChange={(e) => dispatch({ type: "fieldsChanged", fields: { month: e.target.value } })}
						>
							{(MONTHS.includes(fields.month) ? MONTHS : [fields.month, ...MONTHS]).map((m) => (
								<option key={m}>{m}</option>
							))}
						</select>
					</label>
					<label>
						Номер
						<input
							type="number"
							min={1}
							value={fields.number}
							onChange={(e) => dispatch({ type: "fieldsChanged", fields: { number: Number(e.target.value) } })}
						/>
					</label>
				</div>
				<label>
					Тема
					<input
						value={fields.topic}
						onChange={(e) => dispatch({ type: "fieldsChanged", fields: { topic: e.target.value } })}
					/>
				</label>
				<label>
					Персонаж-сюрприз
					<input
						value={fields.character ?? ""}
						onChange={(e) => dispatch({ type: "fieldsChanged", fields: { character: e.target.value } })}
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
				{fields.objectives.map((objective, i) => {
					const own = issuesAt(issues, `objectives[${i}]`);
					return (
						<div key={i}>
							<div className="objective">
								<span className="number">{i + 1}</span>
								<AutoTextarea
									aria-label={`Цель ${i + 1}`}
									rows={3}
									className={own.length ? "invalid" : ""}
									value={objective}
									onChange={(e) =>
										dispatch({
											type: "fieldsChanged",
											fields: { objectives: replaceItem(fields.objectives, i, e.target.value) },
										})
									}
								/>
								<button type="button" onClick={() => dispatch({ type: "objectiveRemoved", index: i })}>
									Удалить
								</button>
							</div>
							<IssueList issues={own} />
						</div>
					);
				})}
				<button type="button" onClick={() => dispatch({ type: "objectiveAdded" })}>
					+ Добавить цель
				</button>
			</section>

			<section className="sheet">
				<h2>Оборудование</h2>
				<LinesTextarea
					aria-label="Оборудование"
					rows={3}
					className={equipmentIssues.length ? "invalid" : ""}
					placeholder="Каждый предмет — с новой строки"
					value={fields.equipment}
					onChange={(equipment) => dispatch({ type: "fieldsChanged", fields: { equipment } })}
				/>
				<IssueList issues={equipmentIssues} />
			</section>

			<section className="sheet">
				<h2>Ход занятия</h2>
				<IssueList issues={issuesAt(issues, "sections")} />
				<ol className="cards">
					{parts.map((part, i) => (
						<SectionCard
							key={part.key}
							index={i}
							total={parts.length}
							section={part.section}
							issues={issues}
							note={part.note}
							onNote={(note) => dispatch({ type: "noteChanged", index: i, note })}
							onChange={(section) => dispatch({ type: "sectionChanged", index: i, section })}
							onMove={(delta) => dispatch({ type: "sectionMoved", index: i, delta })}
							onRemove={() => dispatch({ type: "sectionRemoved", index: i })}
						/>
					))}
				</ol>
				<button type="button" onClick={() => dispatch({ type: "sectionAdded" })}>
					+ Добавить часть
				</button>
			</section>

			<section className="sheet">
				<h2>Поправить с помощью нейросети</h2>
				<p className="hint">
					Напишите, что изменить, — в общем поле или в отдельных частях («Что изменить в этой части»).
					Нейросеть перепишет конспект с учётом ваших правок и замечаний, остальное оставит как есть.
					Результат не сохранится, пока вы сами не нажмёте «Сохранить».
				</p>
				<AutoTextarea
					aria-label="Общее пожелание"
					rows={3}
					placeholder="Например: сделай слова проще и добавь ещё одну игру с мячом"
					value={feedback}
					disabled={busy !== null}
					onChange={(e) => dispatch({ type: "feedbackChanged", feedback: e.target.value })}
				/>
				<div className="row-actions">
					<button type="button" className="primary" disabled={busy !== null || !hasRemarks} onClick={revise}>
						{busy === "revise" ? "Переписываем…" : "Переписать с учётом замечаний"}
					</button>
					{state.before && (
						<button type="button" disabled={busy !== null} onClick={() => dispatch({ type: "undone" })}>
							Вернуть прежний текст
						</button>
					)}
				</div>
				{busy === "revise" && <Progress />}
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
