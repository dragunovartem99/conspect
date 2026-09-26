import type { Dispatch } from "react";

import type { Issue } from "../api/types";
import { IssueList } from "./IssueList";
import { issuesAt } from "./issues";
import { LinesTextarea } from "./LinesTextarea";
import type { EditorAction, EditorState } from "./state";

interface Props {
	equipment: EditorState["fields"]["equipment"];
	issues: Issue[];
	dispatch: Dispatch<EditorAction>;
}

export function EquipmentSheet({ equipment, issues, dispatch }: Props) {
	const own = issuesAt(issues, "equipment");
	return (
		<section className="sheet">
			<h2>Оборудование</h2>
			<LinesTextarea
				aria-label="Оборудование"
				rows={3}
				className={own.length > 0 ? "invalid" : ""}
				placeholder="Каждый предмет — с новой строки"
				value={equipment}
				onChange={(value) =>
					dispatch({ type: "fieldsChanged", fields: { equipment: value } })
				}
			/>
			<IssueList issues={own} />
		</section>
	);
}
