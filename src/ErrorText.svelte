<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<!-- A failure the user should read: announced to screen readers as soon as it shows. -->
<p
	class="error-text"
	role="alert"
>
	{@render children()}
</p>
