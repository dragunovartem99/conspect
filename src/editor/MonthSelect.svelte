<script lang="ts">
	import { MONTHS } from "./labels";

	/** A month picker that keeps a stored month outside the usual list selectable. */
	let { value = $bindable() }: { value: string } = $props();

	const months = $derived(MONTHS.includes(value) ? MONTHS : [value, ...MONTHS]);
</script>

<select bind:value>
	{#each months as month (month)}
		<option>{month}</option>
	{/each}
</select>
