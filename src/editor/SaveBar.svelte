<script lang="ts">
	interface Props {
		error: string | null;
		dirty: boolean;
		busy: "save" | "docx" | "revise" | null;
		onSave: () => void;
		onDownload: () => void;
	}

	/** The status line with save and download, at the bottom of the editor. */
	let { error, dirty, busy, onSave, onDownload }: Props = $props();
</script>

<div class="actions">
	<span
		class="status"
		role="status"
	>
		{#if error}
			<span class="error-text">{error}</span>
		{:else if dirty}
			Есть несохранённые изменения
		{:else}
			Сохранено
		{/if}
	</span>
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
