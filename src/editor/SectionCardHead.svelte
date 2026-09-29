<script lang="ts">
	import type { BlockLabel } from "../api/types";
	import Icon from "../Icon.svelte";

	interface Props {
		index: number;
		total: number;
		blocks: BlockLabel[];
		block: string;
		onMove: (delta: -1 | 1) => void;
		onRemove: () => void;
	}

	/** A part's number, block, and the buttons that move or remove it. */
	let { index, total, blocks, block = $bindable(), onMove, onRemove }: Props = $props();

	// A block this lesson does not know (e.g. from an older lesson) is still shown, by its id.
	const options = $derived(
		blocks.some((b) => b.block === block) ? blocks : [...blocks, { block, label: block }]
	);
</script>

<div class="card-head">
	<span class="number">{index + 1}</span>
	<select
		aria-label="Вид части"
		bind:value={block}
	>
		{#each options as option (option.block)}
			<option value={option.block}>{option.label}</option>
		{/each}
	</select>
	<span class="spacer"></span>
	<button
		type="button"
		class="square"
		aria-label="Выше"
		disabled={index === 0}
		onclick={() => onMove(-1)}
	>
		<Icon name="up" />
	</button>
	<button
		type="button"
		class="square"
		aria-label="Ниже"
		disabled={index === total - 1}
		onclick={() => onMove(1)}
	>
		<Icon name="down" />
	</button>
	<button
		type="button"
		onclick={onRemove}
	>
		Удалить
	</button>
</div>
