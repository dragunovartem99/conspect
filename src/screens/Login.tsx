import { useState, type FormEvent } from "react";
import { login } from "../api/client";
import { useAction } from "../hooks";

/** Signing in stores the token, which by itself takes the app past this screen. */
export function Login() {
	const [password, setPassword] = useState("");
	const { busy, error, run } = useAction<"login">();

	function submit(event: FormEvent) {
		event.preventDefault();
		void run("login", () => login(password), { leaves: true });
	}

	return (
		<form className="login sheet" onSubmit={submit}>
			<h2>Вход</h2>
			<label>
				Пароль
				<input
					type="password"
					autoFocus
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</label>
			{error && <p className="error-text" role="alert">{error}</p>}
			<button className="primary" disabled={busy !== null || !password}>
				{busy ? "Входим…" : "Войти"}
			</button>
		</form>
	);
}
