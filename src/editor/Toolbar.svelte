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

	/** The bar at the bottom of the editor: the status, the actions, and the undo of a rewrite. */
	let { error, dirty, busy, remarks, canUndo, onSave, onDownload, onRevise, onUndo }: Props =
		$props();
</script>

<div class="toolbar">
	{#if canUndo}
		<div class="rewritten">
			Конспект переписан. Проверьте текст.
			<button
				type="button"
				disabled={busy !== null}
				onclick={onUndo}
			>
				Вернуть как было
			</button>
		</div>
	{/if}
	<div class="toolbar-row">
		<span
			class="status"
			role="status"
		>
			{#if error}
				<span class="error-text">{error}</span>
			{:else if busy === "revise"}
				Ожидайте 30–90 секунд
			{:else if busy === "save"}
				Сохраняем…
			{:else if busy === "docx"}
				Готовим файл…
			{:else if dirty}
				<span class="unsaved">Не сохранено</span>
			{:else}
				Сохранено
			{/if}
		</span>
		<div class="buttons">
			<button
				type="button"
				title={remarks === 0 ? "Сначала напишите, что изменить" : undefined}
				disabled={busy !== null || remarks === 0}
				onclick={onRevise}
			>
				Переписать
			</button>
			<button
				type="button"
				disabled={busy !== null || !dirty}
				onclick={onSave}
			>
				Сохранить
			</button>
			<button
				type="button"
				class="primary"
				disabled={busy !== null}
				onclick={onDownload}
			>
				Скачать .docx
			</button>
		</div>
	</div>
</div>
