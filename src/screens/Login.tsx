import { useState, type FormEvent } from "react";
import { ApiError, login } from "../api/client";

export function Login({ onSignedIn }: { onSignedIn: () => void }) {
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(event: FormEvent) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await login(password);
			onSignedIn();
		} catch (e) {
			setError(e instanceof ApiError && e.status === 401 ? "Неверный пароль." : message(e));
			setBusy(false);
		}
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
			<button className="primary" disabled={busy || !password}>
				{busy ? "Входим…" : "Войти"}
			</button>
		</form>
	);
}

export const message = (e: unknown): string =>
	e instanceof Error ? e.message : "Что-то пошло не так.";
