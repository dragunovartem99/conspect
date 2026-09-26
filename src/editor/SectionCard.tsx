import type { Issue, Section } from "../api/types";
import { AutoTextarea } from "./AutoTextarea";
import { IssueList } from "./IssueList";
import { issuesAt } from "./issues";
import { LinesTextarea } from "./LinesTextarea";
import { SectionCardHead } from "./SectionCardHead";

interface Props {
	index: number;
	total: number;
	section: Section;
	issues: Issue[];
	note: string;
	onNote: (note: string) => void;
	onChange: (section: Section) => void;
	onMove: (delta: -1 | 1) => void;
	onRemove: () => void;
}

export function SectionCard({
	index,
	total,
	section,
	issues,
	note,
	onNote,
	onChange,
	onMove,
	onRemove,
}: Props) {
	const path = `sections[${index}]`;
	const own = issuesAt(issues, path);
	const titleIssues = issuesAt(issues, `${path}.title`);
	const hasError = [...own, ...titleIssues].some((i) => i.severity === "error");

	return (
		<li className={`card${hasError ? " has-error" : ""}`}>
			<SectionCardHead
				index={index}
				total={total}
				kind={section.kind}
				onKind={(kind) => onChange({ ...section, kind })}
				onMove={onMove}
				onRemove={onRemove}
			/>

			<input
				aria-label="Заголовок части"
				className={titleIssues.length > 0 ? "invalid" : ""}
				placeholder="Заголовок"
				value={section.title}
				onChange={(e) => onChange({ ...section, title: e.target.value })}
			/>
			<IssueList issues={titleIssues} />

			<LinesTextarea
				aria-label="Текст части"
				rows={3}
				placeholder="Каждый абзац — с новой строки"
				value={section.paragraphs}
				onChange={(paragraphs) => onChange({ ...section, paragraphs })}
			/>
			<IssueList issues={own} />

			<details className="note">
				<summary>Что изменить в этой части{note && " ✎"}</summary>
				<AutoTextarea
					aria-label="Замечание к части"
					rows={2}
					placeholder="Например: сделай загадку проще"
					value={note}
					onChange={(e) => onNote(e.target.value)}
				/>
			</details>
		</li>
	);
}
