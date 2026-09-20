import { useEffect, useState } from "react";
import { logout, onSignedOut } from "./api/client";
import { getToken } from "./api/token";
import { listPath, parseRoute, useHash } from "./router";
import { Editor } from "./screens/Editor";
import { Lessons } from "./screens/Lessons";
import { Login } from "./screens/Login";

export function App() {
	const [signedIn, setSignedIn] = useState(() => getToken() !== null);
	const route = parseRoute(useHash());

	useEffect(() => onSignedOut(() => setSignedIn(false)), []);

	return (
		<>
			<header>
				<a href={listPath}>
					<h1>Конспекты</h1>
				</a>
				{signedIn && (
					<button type="button" onClick={logout}>
						Выйти
					</button>
				)}
			</header>
			<main>
				{!signedIn ? (
					<Login onSignedIn={() => setSignedIn(true)} />
				) : route.name === "lesson" ? (
					<Editor id={route.id} />
				) : (
					<Lessons />
				)}
			</main>
		</>
	);
}
