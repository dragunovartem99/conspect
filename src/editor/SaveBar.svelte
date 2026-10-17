<script lang="ts">
	interface Props {
		error: string | null;
		dirty: boolean;
		busy: "save" | "docx" | "revise" | null;
		/** How many remarks the rewrite would follow: the general one and the notes on parts. */
		remarks: number;
		canUndo: boolean;
		onSave: () => void;
		onDownload: () => void;
		onRevise: () => void;
		onUndo: () => void;
	}

	/** The status line with save, download and rewrite, at the bottom of the editor. */
	let { error, dirty, busy, remarks, canUndo, onSave, onDownload, onRevise, onUndo }: Props =
		$props();
</script>

<div class="actions">
	<span
		class="status"
		role="status"
	>
		{#if error}
			<span class="error-text">{error}</span>
		{:else if busy === "revise"}
			Нейросеть переписывает конспект, это занимает от 30 до 90 секунд
		{:else if dirty}
			Есть несохранённые изменения
		{:else}
			Сохранено
		{/if}
	</span>
	{#if canUndo}
		<button
			type="button"
			disabled={busy !== null}
			onclick={onUndo}
		>
			Вернуть прежний текст
		</button>
	{/if}
	{#if remarks > 0 || busy === "revise"}
		<button
			type="button"
			disabled={busy !== null}
			onclick={onRevise}
		>
			{busy === "revise" ? "Переписываем…" : `Переписать (${remarks})`}
		</button>
	{/if}
	<button
		type="button"
		disabled={busy !== null || !dirty}
		onclick={onSave}
	>
		{busy === "save" ? "Сохраняем…" : "Сохранить"}
	</button>
	<button
		type="button"
		class="primary"
		disabled={busy !== null}
		onclick={onDownload}
	>
		{busy === "docx" ? "Готовим файл…" : "Скачать .docx"}
	</button>
</div>
