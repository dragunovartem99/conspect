<script lang="ts">
	import { getLesson, message } from "../api/client";
	import LessonEditor from "../editor/LessonEditor.svelte";
	import ErrorText from "../ErrorText.svelte";

	/** Loads once: wrap in `{#key id}` so another lesson starts from scratch. */
	let { id }: { id: string } = $props();
	// svelte-ignore state_referenced_locally
	const loading = getLesson(id);
</script>

{#await loading}
	<p class="muted">Загрузка…</p>
{:then initial}
	<LessonEditor {initial} />
{:catch e}
	<ErrorText>{message(e)}</ErrorText>
{/await}
