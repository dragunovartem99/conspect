<script lang="ts">
	import type { Issue } from "../api/types";

	let { issues }: { issues: Issue[] } = $props();
</script>

{#if issues.length > 0}
	<ul class="issues">
		{#each issues as issue, i (`${issue.code}-${issue.path}-${i}`)}
			<li>
				<span class="tag {issue.severity}">
					{issue.severity === "error" ? "Ошибка" : "Внимание"}
				</span>
				{issue.message}
			</li>
		{/each}
	</ul>
{/if}
