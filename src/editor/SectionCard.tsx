import { Icon } from "../Icon";
import type { Issue, Section, SectionKind } from "../api/types";
import { AutoTextarea } from "./AutoTextarea";
import { isRitual } from "./edit";
import { IssueList } from "./IssueList";
import { issuesAt, KIND_LABELS } from "./issues";

interface Props {
	index: number;
	total: number;
	section: Section;
	issues: Issue[];
	onChange: (section: Section) => void;
	onMove: (delta: -1 | 1) => void;
	onRemove: () => void;
}

const KINDS = Object.keys(KIND_LABELS) as SectionKind[];

export function SectionCard({ index, total, section, issues, onChange, onMove, onRemove }: Props) {
	const path = `sections[${index}]`;
	const own = issuesAt(issues, path);
	const titleIssues = issuesAt(issues, `${path}.title`);
	const fixed = isRitual(section.kind);
	const hasError = [...own, ...titleIssues].some((i) => i.severity === "error");

	return (
		<li className={`card${hasError ? " has-error" : ""}`}>
			<div className="card-head">
				<span className="number">{index + 1}</span>
				<select
					aria-label="Вид части"
					value={section.kind}
					disabled={fixed}
					onChange={(e) => onChange({ ...section, kind: e.target.value as SectionKind })}
				>
					{KINDS.map((kind) => (
						<option key={kind} value={kind}>
							{KIND_LABELS[kind]}
						</option>
					))}
				</select>
				<span className="spacer" />
				<button type="button" className="square" aria-label="Выше" disabled={index === 0} onClick={() => onMove(-1)}>
					<Icon name="up" />
				</button>
				<button
					type="button"
					className="square"
					aria-label="Ниже"
					disabled={index === total - 1}
					onClick={() => onMove(1)}
				>
					<Icon name="down" />
				</button>
				<button type="button" onClick={onRemove}>
					Удалить
				</button>
			</div>

			<input
				aria-label="Заголовок части"
				className={titleIssues.length ? "invalid" : ""}
				placeholder="Заголовок"
				value={section.title}
				onChange={(e) => onChange({ ...section, title: e.target.value })}
			/>
			<IssueList issues={titleIssues} />

			<AutoTextarea
				aria-label="Текст части"
				rows={3}
				readOnly={fixed}
				placeholder="Каждый абзац — с новой строки"
				value={section.paragraphs.join("\n")}
				onChange={(e) => onChange({ ...section, paragraphs: e.target.value.split("\n") })}
			/>
			{fixed && <p className="hint">Текст ритуала фиксированный, он подставляется автоматически.</p>}
			<IssueList issues={own} />
		</li>
	);
}
