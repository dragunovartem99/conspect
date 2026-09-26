import type { Dispatch } from "react";

import type { Issue } from "../api/types";
import { AutoTextarea } from "./AutoTextarea";
import { replaceItem } from "./edit";
import { IssueList } from "./IssueList";
import { issuesAt } from "./issues";
import type { EditorAction } from "./state";

interface Props {
	objectives: string[];
	issues: Issue[];
	dispatch: Dispatch<EditorAction>;
}

export function ObjectivesSheet({ objectives, issues, dispatch }: Props) {
	return (
		<section className="sheet">
			<h2>Программное содержание</h2>
			<IssueList issues={issuesAt(issues, "objectives")} />
			{objectives.map((objective, i) => {
				const own = issuesAt(issues, `objectives[${i}]`);
				return (
					<div key={i}>
						<div className="objective">
							<span className="number">{i + 1}</span>
							<AutoTextarea
								aria-label={`Цель ${i + 1}`}
								rows={3}
								className={own.length > 0 ? "invalid" : ""}
								value={objective}
								onChange={(e) =>
									dispatch({
										type: "fieldsChanged",
										fields: {
											objectives: replaceItem(objectives, i, e.target.value),
										},
									})
								}
							/>
							<button
								type="button"
								onClick={() => dispatch({ type: "objectiveRemoved", index: i })}
							>
								Удалить
							</button>
						</div>
						<IssueList issues={own} />
					</div>
				);
			})}
			<button
				type="button"
				onClick={() => dispatch({ type: "objectiveAdded" })}
			>
				+ Добавить цель
			</button>
		</section>
	);
}
