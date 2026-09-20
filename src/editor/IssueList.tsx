import type { Issue } from "../api/types";

export function IssueList({ issues }: { issues: Issue[] }) {
	if (issues.length === 0) return null;
	return (
		<ul className="issues">
			{issues.map((issue, i) => (
				<li key={`${issue.code}-${issue.path}-${i}`}>
					<span className={`tag ${issue.severity}`}>
						{issue.severity === "error" ? "Ошибка" : "Внимание"}
					</span>{" "}
					{issue.message}
				</li>
			))}
		</ul>
	);
}
