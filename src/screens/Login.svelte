<script lang="ts">
	import { Action } from "../action.svelte";
	import { login } from "../api/client";
	import ErrorText from "../ErrorText.svelte";

	let password = $state("");
	const action = new Action<"login">();

	/** Signing in stores the token, which by itself takes the app past this screen. */
	function submit(event: SubmitEvent) {
		event.preventDefault();
		void action.run("login", () => login(password), { leaves: true });
	}
</script>

<form
	class="login sheet"
	onsubmit={submit}
>
	<h2>Вход</h2>
	<label>
		Пароль
		<!-- svelte-ignore a11y_autofocus: the password is the only thing on the screen. -->
		<input
			type="password"
			autofocus
			autocomplete="current-password"
			bind:value={password}
		/>
	</label>
	{#if action.error}
		<ErrorText>{action.error}</ErrorText>
	{/if}
	<button
		class="primary"
		disabled={action.busy !== null || !password}
	>
		{action.busy ? "Входим…" : "Войти"}
	</button>
</form>
