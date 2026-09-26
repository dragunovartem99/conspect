<script lang="ts">
	import Progress from "../Progress.svelte";
	import AutoTextarea from "./AutoTextarea.svelte";
	import type { Draft } from "./draft.svelte";

	interface Props {
		draft: Draft;
		/** Another action is running, or this one. */
		disabled: boolean;
		revising: boolean;
		onRevise: () => void;
	}

	let { draft, disabled, revising, onRevise }: Props = $props();
</script>

<section class="sheet">
	<h2>Поправить с помощью нейросети</h2>
	<p class="hint">
		Напишите, что изменить, — в общем поле или в отдельных частях («Что изменить в этой части»).
		Нейросеть перепишет конспект с учётом ваших правок и замечаний, остальное оставит как есть.
		Результат не сохранится, пока вы сами не нажмёте «Сохранить».
	</p>
	<AutoTextarea
		aria-label="Общее пожелание"
		rows={3}
		placeholder="Например: сделай слова проще и добавь ещё одну игру с мячом"
		{disabled}
		bind:value={draft.feedback}
	/>
	<div class="row-actions">
		<button
			type="button"
			class="primary"
			disabled={disabled || !draft.hasRemarks}
			onclick={onRevise}
		>
			{revising ? "Переписываем…" : "Переписать с учётом замечаний"}
		</button>
		{#if draft.before}
			<button
				type="button"
				{disabled}
				onclick={() => draft.undo()}
			>
				Вернуть прежний текст
			</button>
		{/if}
	</div>
	{#if revising}
		<Progress />
	{/if}
</section>
