<script lang="ts">
	import { Action } from "../action.svelte";
	import { getDocx, reviseLesson, updateLesson } from "../api/client";
	import type { LessonWithIssues } from "../api/types";
	import Icon from "../Icon.svelte";
	import { listPath } from "../router";
	import { saveFile } from "../saveFile";
	import { Draft } from "./draft.svelte";
	import { cleanLesson } from "./edit";
	import EquipmentSheet from "./EquipmentSheet.svelte";
	import LessonHeader from "./LessonHeader.svelte";
	import ObjectivesSheet from "./ObjectivesSheet.svelte";
	import PartsSheet from "./PartsSheet.svelte";
	import ReviseSheet from "./ReviseSheet.svelte";
	import SaveBar from "./SaveBar.svelte";

	let { initial }: { initial: LessonWithIssues } = $props();

	// svelte-ignore state_referenced_locally
	const draft = new Draft(initial);
	const action = new Action<"save" | "docx" | "revise">();

	const save = () =>
		action.run("save", async () => draft.saved(await updateLesson(cleanLesson(draft.lesson))));

	const revise = () =>
		action.run("revise", async () => {
			const result = await reviseLesson(draft.fields.id, {
				lesson: cleanLesson(draft.lesson),
				feedback: draft.feedback.trim(),
				sections: draft.notes,
			});
			draft.revised(result);
		});

	async function download() {
		if (draft.dirty && !(await save())) return;
		await action.run("docx", async () => {
			const { blob, filename } = await getDocx(draft.fields.id);
			saveFile(blob, filename);
		});
	}

	// Asks the browser to confirm leaving the page with unsaved changes.
	function warnOnLeave(event: BeforeUnloadEvent) {
		if (draft.dirty) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={warnOnLeave} />

<a
	class="back"
	href={listPath}
>
	<Icon name="left" /> Все конспекты
</a>
<LessonHeader {draft} />
<ObjectivesSheet {draft} />
<EquipmentSheet {draft} />
<PartsSheet {draft} />
<ReviseSheet
	{draft}
	disabled={action.busy !== null}
	revising={action.busy === "revise"}
	onRevise={revise}
/>
<SaveBar
	error={action.error}
	dirty={draft.dirty}
	busy={action.busy}
	onSave={save}
	onDownload={download}
/>
