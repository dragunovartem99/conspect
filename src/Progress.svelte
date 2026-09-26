<script lang="ts">
	/** Shown while the neural network is writing; mount it only for that time. */
	let { showElapsed = false }: { showElapsed?: boolean } = $props();

	let seconds = $state(0);

	$effect(() => {
		if (!showElapsed) return;
		const timer = setInterval(() => seconds++, 1000);
		return () => clearInterval(timer);
	});
</script>

<div
	role="status"
	class="progress"
>
	<div class="bar"></div>
	<p class="muted">
		Это занимает от 30 до 90 секунд.{showElapsed ? ` Прошло: ${seconds} с.` : ""}
	</p>
</div>
