<script lang="ts">
	import { Action } from "../action.svelte";
	import { generateLesson } from "../api/client";
	import type { Profile } from "../api/types";
	import AutoTextarea from "../editor/AutoTextarea.svelte";
	import { MONTHS } from "../editor/labels";
	import MonthSelect from "../editor/MonthSelect.svelte";
	import ErrorText from "../ErrorText.svelte";
	import { ageLabel, ages, kindsOf } from "../profiles";
	import Progress from "../Progress.svelte";
	import { lessonPath } from "../router";

	let { profiles }: { profiles: Profile[] } = $props();

	let pickedAge: number | null = $state(null);
	let kind = $state("");
	let month = $state(MONTHS[new Date().getMonth()] ?? "");
	let number: number | null = $state(1);
	let topic = $state("");
	let character = $state("");
	let brief = $state("");
	const action = new Action<"generate">();
	const age = $derived(pickedAge ?? ages(profiles)[0] ?? 0);
	const kinds = $derived(kindsOf(profiles, age));
	const profile = $derived(kinds.find((p) => p.kind === kind) ?? kinds[0]);
	const hasSurprise = $derived(profile?.blocks.some((b) => b.block === "surprise") ?? false);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (number === null || !profile) return;
		const request = {
			age: profile.age,
			kind: profile.kind,
			month,
			number,
			topic: topic.trim(),
			character: (hasSurprise && character.trim()) || null,
			brief: brief.trim() || null,
		};
		void action.run(
			"generate",
			async () => {
				const result = await generateLesson(request);
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
				Возраст
				<select bind:value={() => age, (value) => (pickedAge = value)}>
					{#each ages(profiles) as value (value)}
						<option {value}>{ageLabel(value)}</option>
					{/each}
				</select>
			</label>
			{#if kinds.length > 1}
				<label>
					Занятие
					<select bind:value={() => profile?.kind ?? "", (value) => (kind = value)}>
						{#each kinds as p (p.kind)}
							<option value={p.kind}>{p.name}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
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
					bind:value={number}
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
		{#if hasSurprise}
			<label>
				Персонаж-сюрприз <span class="muted">(необязательно)</span>
				<input
					bind:value={character}
					placeholder="Если пусто, придумает нейросеть"
				/>
			</label>
		{/if}
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
		disabled={action.busy !== null ||
			!profile ||
			!topic.trim() ||
			number === null ||
			number < 1}
	>
		{action.busy ? "Составляем конспект…" : "Составить конспект"}
	</button>
	{#if action.busy}
		<Progress showElapsed />
	{/if}
</form>
