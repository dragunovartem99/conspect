<script lang="ts">
	import type { Draft } from "./draft.svelte";
	import IssueList from "./IssueList.svelte";
	import { issuesAt } from "./issues";
	import SectionCard from "./SectionCard.svelte";

	let { draft }: { draft: Draft } = $props();
</script>

<section class="sheet">
	<h2>Ход занятия</h2>
	<IssueList issues={issuesAt(draft.issues, "sections")} />
	<ol class="cards">
		{#each draft.parts as part, i (part.key)}
			<SectionCard
				{draft}
				index={i}
			/>
		{/each}
	</ol>
	<button
		type="button"
		onclick={() => draft.addSection()}
	>
		+ Добавить часть
	</button>
</section>
