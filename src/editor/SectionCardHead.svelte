<script
	lang="ts"
	module
>
	import type { SectionKind } from "../api/types";
	import { KIND_LABELS } from "./labels";

	const KINDS = Object.keys(KIND_LABELS) as SectionKind[];
</script>

<script lang="ts">
	import Icon from "../Icon.svelte";

	interface Props {
		index: number;
		total: number;
		kind: SectionKind;
		onMove: (delta: -1 | 1) => void;
		onRemove: () => void;
	}

	/** A part's number, kind, and the buttons that move or remove it. */
	let { index, total, kind = $bindable(), onMove, onRemove }: Props = $props();
</script>

<div class="card-head">
	<span class="number">{index + 1}</span>
	<select
		aria-label="Вид части"
		bind:value={kind}
	>
		{#each KINDS as k (k)}
			<option value={k}>{KIND_LABELS[k]}</option>
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
