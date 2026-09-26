<script
	lang="ts"
	module
>
	const PATHS = {
		up: "M8 13V3M3.5 7.5 8 3l4.5 4.5",
		down: "M8 3v10M3.5 8.5 8 13l4.5-4.5",
		left: "M13 8H3M7.5 3.5 3 8l4.5 4.5",
	};
</script>

<script lang="ts">
	let { name }: { name: keyof typeof PATHS } = $props();
</script>

<svg
	class="icon"
	viewBox="0 0 16 16"
	width="16"
	height="16"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={PATHS[name]} />
</svg>
