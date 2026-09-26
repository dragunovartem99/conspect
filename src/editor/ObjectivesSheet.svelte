<script lang="ts">
	import AutoTextarea from "./AutoTextarea.svelte";
	import type { Draft } from "./draft.svelte";
	import IssueList from "./IssueList.svelte";
	import { issuesAt } from "./issues";

	let { draft }: { draft: Draft } = $props();
</script>

<section class="sheet">
	<h2>Программное содержание</h2>
	<IssueList issues={issuesAt(draft.issues, "objectives")} />
	{#each draft.fields.objectives as _, i (i)}
		{@const own = issuesAt(draft.issues, `objectives[${i}]`)}
		<div>
			<div class="objective">
				<span class="number">{i + 1}</span>
				<AutoTextarea
					aria-label="Цель {i + 1}"
					rows={3}
					class={own.length > 0 ? "invalid" : ""}
					bind:value={draft.fields.objectives[i]}
				/>
				<button
					type="button"
					onclick={() => draft.removeObjective(i)}
				>
					Удалить
				</button>
			</div>
			<IssueList issues={own} />
		</div>
	{/each}
	<button
		type="button"
		onclick={() => draft.addObjective()}
	>
		+ Добавить цель
	</button>
</section>
