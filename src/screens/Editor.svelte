<script lang="ts">
	import { getLesson, listProfiles, message } from "../api/client";
	import type { Lesson, Profile } from "../api/types";
	import LessonEditor from "../editor/LessonEditor.svelte";
	import ErrorText from "../ErrorText.svelte";

	/** Loads once: wrap in `{#key id}` so another lesson starts from scratch. */
	let { id }: { id: string } = $props();
	// The blocks the lesson's kind may use, for the part pickers.
	const blocksOf = (lesson: Lesson, profiles: Profile[]) =>
		profiles.find((p) => p.age === lesson.age && p.kind === lesson.kind)?.blocks ?? [];

	// svelte-ignore state_referenced_locally
	const loading = Promise.all([getLesson(id), listProfiles()]);
</script>

{#await loading}
	<p class="muted">Загрузка…</p>
{:then [initial, profiles]}
	<LessonEditor
		{initial}
		blocks={blocksOf(initial.lesson, profiles)}
	/>
{:catch e}
	<ErrorText>{message(e)}</ErrorText>
{/await}
