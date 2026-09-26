interface Props {
	error: string | null;
	dirty: boolean;
	busy: "save" | "docx" | "revise" | null;
	onSave: () => void;
	onDownload: () => void;
}

/** The status line with save and download, at the bottom of the editor. */
export function SaveBar({ error, dirty, busy, onSave, onDownload }: Props) {
	return (
		<div className="actions">
			<span
				className="status"
				role="status"
			>
				{error ? (
					<span className="error-text">{error}</span>
				) : dirty ? (
					"Есть несохранённые изменения"
				) : (
					"Сохранено"
				)}
			</span>
			<button
				type="button"
				disabled={busy !== null || !dirty}
				onClick={onSave}
			>
				{busy === "save" ? "Сохраняем…" : "Сохранить"}
			</button>
			<button
				type="button"
				className="primary"
				disabled={busy !== null}
				onClick={onDownload}
			>
				{busy === "docx" ? "Готовим файл…" : "Скачать .docx"}
			</button>
		</div>
	);
}
