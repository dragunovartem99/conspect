<script lang="ts">
	import { Action } from "../action.svelte";
	import { generateLesson } from "../api/client";
	import AutoTextarea from "../editor/AutoTextarea.svelte";
	import { MONTHS } from "../editor/labels";
	import MonthSelect from "../editor/MonthSelect.svelte";
	import ErrorText from "../ErrorText.svelte";
	import Progress from "../Progress.svelte";
	import { lessonPath } from "../router";

	let { nextNumber }: { nextNumber: number } = $props();

	let month = $state(MONTHS[new Date().getMonth()] ?? "");
	/** Undefined until the teacher types a number: until then it follows the suggested one. */
	let typedNumber: number | null | undefined = $state();
	let topic = $state("");
	let character = $state("");
	let brief = $state("");
	const action = new Action<"generate">();
	const number = $derived(typedNumber === undefined ? nextNumber : typedNumber);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (number === null) return;
		void action.run(
			"generate",
			async () => {
				const result = await generateLesson({
					month,
					number,
					topic: topic.trim(),
					character: character.trim() || null,
					brief: brief.trim() || null,
				});
				window.location.hash = lessonPath(result.lesson.id);
			},
			{ leaves: true }
		);
	}
</script>

<form
	class="sheet new-lesson"
	onsubmit={submit}
>
	<h2>Новый конспект</h2>
	<fieldset disabled={action.busy !== null}>
		<div class="row">
			<label>
				Месяц
				<MonthSelect bind:value={month} />
			</label>
			<label>
				Номер занятия
				<input
					type="number"
					min="1"
					bind:value={() => number, (value) => (typedNumber = value)}
				/>
			</label>
		</div>
		<label>
			Тема
			<input
				bind:value={topic}
				placeholder="Овощи"
			/>
		</label>
		<label>
			Персонаж-сюрприз <span class="muted">(необязательно)</span>
			<input
				bind:value={character}
				placeholder="Если пусто, придумает нейросеть"
			/>
		</label>
		<label>
			Техническое задание <span class="muted">(необязательно)</span>
			<AutoTextarea
				rows={3}
				bind:value={brief}
				placeholder="Что обязательно должно быть в конспекте: игры, загадки, задания, чего избегать"
			/>
		</label>
	</fieldset>
	{#if action.error}
		<ErrorText>{action.error}</ErrorText>
	{/if}
	<button
		class="primary"
		disabled={action.busy !== null || !topic.trim() || number === null || number < 1}
	>
		{action.busy ? "Составляем конспект…" : "Составить конспект"}
	</button>
	{#if action.busy}
		<Progress showElapsed />
	{/if}
</form>
