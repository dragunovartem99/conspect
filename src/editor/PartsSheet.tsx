import type { Dispatch } from "react";

import type { Issue } from "../api/types";
import { IssueList } from "./IssueList";
import { issuesAt } from "./issues";
import { SectionCard } from "./SectionCard";
import type { EditorAction, Part } from "./state";

interface Props {
	parts: Part[];
	issues: Issue[];
	dispatch: Dispatch<EditorAction>;
}

export function PartsSheet({ parts, issues, dispatch }: Props) {
	return (
		<section className="sheet">
			<h2>Ход занятия</h2>
			<IssueList issues={issuesAt(issues, "sections")} />
			<ol className="cards">
				{parts.map((part, i) => (
					<SectionCard
						key={part.key}
						index={i}
						total={parts.length}
						section={part.section}
						issues={issues}
						note={part.note}
						onNote={(note) => dispatch({ type: "noteChanged", index: i, note })}
						onChange={(section) =>
							dispatch({ type: "sectionChanged", index: i, section })
						}
						onMove={(delta) => dispatch({ type: "sectionMoved", index: i, delta })}
						onRemove={() => dispatch({ type: "sectionRemoved", index: i })}
					/>
				))}
			</ol>
			<button
				type="button"
				onClick={() => dispatch({ type: "sectionAdded" })}
			>
				+ Добавить часть
			</button>
		</section>
	);
}
