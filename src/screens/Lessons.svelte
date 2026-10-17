<script lang="ts">
	import { onMount } from "svelte";

	import { deleteLesson, listLessons, listProfiles, message } from "../api/client";
	import type { LessonSummary, Profile } from "../api/types";
	import ErrorText from "../ErrorText.svelte";
	import { profileLabel } from "../profiles";
	import { lessonPath } from "../router";
	import NewLessonForm from "./NewLessonForm.svelte";

	let lessons = $state<LessonSummary[] | null>(null);
	let profiles = $state<Profile[]>([]);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			[lessons, profiles] = await Promise.all([listLessons(), listProfiles()]);
		} catch (e) {
			error = message(e);
		}
	});

	async function remove(lesson: LessonSummary) {
		if (!confirm(`Удалить конспект №${lesson.number} «${lesson.topic}»?`)) return;
		try {
			await deleteLesson(lesson.id);
			lessons = lessons?.filter((l) => l.id !== lesson.id) ?? null;
		} catch (e) {
			error = message(e);
		}
	}
</script>

{#if profiles.length > 0}
	<NewLessonForm {profiles} />
{/if}
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
					<span class="lesson-number">{lesson.month}, №{lesson.number}</span>
					· {lesson.topic}
				</a>
				<span class="muted">
					{profileLabel(profiles, lesson.program, lesson.kind)},
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
