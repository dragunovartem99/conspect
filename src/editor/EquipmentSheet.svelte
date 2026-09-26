<script lang="ts">
	import AutoTextarea from "./AutoTextarea.svelte";
	import type { Draft } from "./draft.svelte";
	import IssueList from "./IssueList.svelte";
	import { issuesAt } from "./issues";

	let { draft }: { draft: Draft } = $props();

	const own = $derived(issuesAt(draft.issues, "equipment"));
</script>

<section class="sheet">
	<h2>Оборудование</h2>
	<AutoTextarea
		aria-label="Оборудование"
		rows={3}
		class={own.length > 0 ? "invalid" : ""}
		placeholder="Каждый предмет — с новой строки"
		bind:value={
			() => draft.fields.equipment.join("\n"),
			(text) => (draft.fields.equipment = text.split("\n"))
		}
	/>
	<IssueList issues={own} />
</section>
