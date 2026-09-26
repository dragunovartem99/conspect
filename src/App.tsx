import { useSyncExternalStore } from "react";

import { logout } from "./api/client";
import { getToken, subscribeToken } from "./api/token";
import { listPath, parseRoute, useHash } from "./router";
import { Editor } from "./screens/Editor";
import { Lessons } from "./screens/Lessons";
import { Login } from "./screens/Login";

const isSignedIn = () => getToken() !== null;

export function App() {
	const signedIn = useSyncExternalStore(subscribeToken, isSignedIn);
	const route = parseRoute(useHash());

	return (
		<>
			<header>
				<a href={listPath}>
					<h1>Конспект</h1>
				</a>
				{signedIn && (
					<button
						type="button"
						onClick={logout}
					>
						Выйти
					</button>
				)}
			</header>
			<main>
				{signedIn ? (
					route.name === "lesson" ? (
						<Editor
							key={route.id}
							id={route.id}
						/>
					) : (
						<Lessons />
					)
				) : (
					<Login />
				)}
			</main>
		</>
	);
}
