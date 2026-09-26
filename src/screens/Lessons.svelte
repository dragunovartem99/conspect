<script lang="ts">
	import { deleteLesson, listLessons, message } from "../api/client";
	import type { LessonSummary } from "../api/types";
	import ErrorText from "../ErrorText.svelte";
	import { lessonPath } from "../router";
	import NewLessonForm from "./NewLessonForm.svelte";

	let lessons = $state<LessonSummary[] | null>(null);
	let error = $state<string | null>(null);

	listLessons().then(
		(list) => (lessons = list),
		(e) => (error = message(e))
	);

	async function remove(lesson: LessonSummary) {
		if (!confirm(`Удалить конспект №${lesson.number} «${lesson.topic}»?`)) return;
		try {
			await deleteLesson(lesson.id);
			lessons = lessons?.filter((l) => l.id !== lesson.id) ?? null;
		} catch (e) {
			error = message(e);
		}
	}

	const nextNumber = $derived(Math.max(0, ...(lessons ?? []).map((l) => l.number)) + 1);
</script>

<NewLessonForm {nextNumber} />
<section class="sheet">
	<h2>Мои конспекты</h2>
	{#if error}
		<ErrorText>{error}</ErrorText>
	{:else if lessons === null}
		<p class="muted">Загрузка…</p>
	{:else if lessons.length === 0}
		<p class="muted">Пока нет ни одного конспекта.</p>
	{/if}
	<ul class="lessons">
		{#each lessons ?? [] as lesson (lesson.id)}
			<li>
				<a href={lessonPath(lesson.id)}>
					<span class="lesson-number">№{lesson.number}</span>
					{lesson.topic}
				</a>
				<span class="muted">
					{lesson.created_at
						? new Date(lesson.created_at).toLocaleDateString("ru-RU")
						: ""}
				</span>
				<button
					type="button"
					onclick={() => remove(lesson)}
				>
					Удалить
				</button>
			</li>
		{/each}
	</ul>
</section>
