<script lang="ts">
	import AutoTextarea from "./AutoTextarea.svelte";
	import type { Draft } from "./draft.svelte";
	import IssueList from "./IssueList.svelte";
	import { issuesAt } from "./issues";
	import SectionCardHead from "./SectionCardHead.svelte";

	let { draft, index }: { draft: Draft; index: number } = $props();

	const part = $derived(draft.parts[index]!);
	const path = $derived(`sections[${index}]`);
	const own = $derived(issuesAt(draft.issues, path));
	const titleIssues = $derived(issuesAt(draft.issues, `${path}.title`));
	const hasError = $derived([...own, ...titleIssues].some((i) => i.severity === "error"));
</script>

<li class={["card", { "has-error": hasError }]}>
	<SectionCardHead
		{index}
		total={draft.parts.length}
		bind:kind={part.section.kind}
		onMove={(delta) => draft.moveSection(index, delta)}
		onRemove={() => draft.removeSection(index)}
	/>

	<input
		aria-label="Заголовок части"
		class={titleIssues.length > 0 ? "invalid" : ""}
		placeholder="Заголовок"
		bind:value={part.section.title}
	/>
	<IssueList issues={titleIssues} />

	<AutoTextarea
		aria-label="Текст части"
		rows={3}
		placeholder="Каждый абзац — с новой строки"
		bind:value={
			() => part.section.paragraphs.join("\n"),
			(text) => (part.section.paragraphs = text.split("\n"))
		}
	/>
	<IssueList issues={own} />

	<details class="note">
		<summary>Что изменить в этой части{part.note ? " ✎" : ""}</summary>
		<AutoTextarea
			aria-label="Замечание к части"
			rows={2}
			placeholder="Например: сделай загадку проще"
			bind:value={part.note}
		/>
	</details>
</li>
