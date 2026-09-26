<script lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";

	/** A textarea that is always as tall as its text, so nothing needs scrolling to read. */
	let { value = $bindable(""), ...props }: HTMLTextareaAttributes & { value?: string } = $props();

	let textarea: HTMLTextAreaElement;

	function fit() {
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight}px`;
	}

	$effect(() => {
		void value;
		fit();
	});
</script>

<svelte:window onresize={fit} />

<textarea
	bind:this={textarea}
	bind:value
	{...props}></textarea>
