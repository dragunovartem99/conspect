<script lang="ts">
	import { logout } from "./api/client";
	import { getToken } from "./api/token.svelte";
	import { listPath, parseRoute } from "./router";
	import Editor from "./screens/Editor.svelte";
	import Lessons from "./screens/Lessons.svelte";
	import Login from "./screens/Login.svelte";

	let hash = $state(window.location.hash);
	const route = $derived(parseRoute(hash));
</script>

<svelte:window onhashchange={() => (hash = window.location.hash)} />

<header>
	<a href={listPath}>
		<h1>Конспект</h1>
	</a>
	{#if getToken()}
		<button
			type="button"
			onclick={logout}
		>
			Выйти
		</button>
	{/if}
</header>
<main>
	{#if !getToken()}
		<Login />
	{:else if route.name === "lesson"}
		<!-- Another lesson starts from scratch. -->
		{#key route.id}
			<Editor id={route.id} />
		{/key}
	{:else}
		<Lessons />
	{/if}
</main>
