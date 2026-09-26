<script lang="ts">
	import type { Draft } from "./draft.svelte";
	import { countBySeverity } from "./issues";
	import MonthSelect from "./MonthSelect.svelte";

	/** Month, number, topic and character, with the tally of issues across the lesson. */
	let { draft }: { draft: Draft } = $props();

	const { errors, warnings } = $derived(countBySeverity(draft.issues));
</script>

<section class="sheet">
	<h2>Конспект №{draft.fields.number}</h2>
	<div class="row">
		<label>
			Месяц
			<MonthSelect bind:value={draft.fields.month} />
		</label>
		<label>
			Номер
			<input
				type="number"
				min="1"
				bind:value={draft.fields.number}
			/>
		</label>
	</div>
	<label>
		Тема
		<input bind:value={draft.fields.topic} />
	</label>
	<label>
		Персонаж-сюрприз
		<input
			bind:value={
				() => draft.fields.character ?? "", (value) => (draft.fields.character = value)
			}
		/>
	</label>
	{#if draft.issues.length > 0}
		<p class="summary">
			Ошибок: {errors} · Предупреждений: {warnings}. Замечания показаны рядом с полями.
		</p>
	{/if}
</section>
