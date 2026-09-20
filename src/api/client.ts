import { clearToken, getToken, setToken } from "./token";
import type {
	GenerateRequest,
	Lesson,
	LessonSummary,
	LessonWithIssues,
	ReviseRequest,
} from "./types";

const API_URL: string =
	import.meta.env.VITE_API_URL ??
	(import.meta.env.PROD ? "https://api.conspect.su" : "http://localhost:50002");

export class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

const signedOutListeners = new Set<() => void>();

/** Called when the server rejects the stored token, so the app can show the login screen. */
export function onSignedOut(listener: () => void): () => void {
	signedOutListeners.add(listener);
	return () => signedOutListeners.delete(listener);
}

async function errorMessage(res: Response): Promise<string> {
	try {
		const body: unknown = await res.json();
		if (typeof body === "object" && body && "detail" in body && typeof body.detail === "string") {
			return body.detail;
		}
	} catch {
		// Not JSON: fall through to the generic messages.
	}
	return res.status === 422 ? "Проверьте введённые данные." : `Ошибка сервера (${res.status}).`;
}

async function request(path: string, init: RequestInit = {}, signedIn = true): Promise<Response> {
	const headers = new Headers(init.headers);
	if (init.body) headers.set("content-type", "application/json");
	const token = getToken();
	if (signedIn && token) headers.set("authorization", `Bearer ${token}`);

	let res: Response;
	try {
		res = await fetch(API_URL + path, { ...init, headers });
	} catch {
		throw new ApiError(0, "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
	}
	if (!res.ok) {
		if (res.status === 401 && signedIn) {
			clearToken();
			signedOutListeners.forEach((listener) => listener());
		}
		throw new ApiError(res.status, await errorMessage(res));
	}
	return res;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
	return (await request(path, init)).json() as Promise<T>;
}

export async function login(password: string): Promise<void> {
	const res = await request(
		"/api/login",
		{ method: "POST", body: JSON.stringify({ password }) },
		false,
	);
	const body = (await res.json()) as { token: string };
	setToken(body.token);
}

export function logout(): void {
	clearToken();
	signedOutListeners.forEach((listener) => listener());
}

export const listLessons = () => json<LessonSummary[]>("/api/lessons");

export const generateLesson = (body: GenerateRequest) =>
	json<LessonWithIssues>("/api/lessons/generate", { method: "POST", body: JSON.stringify(body) });

export const getLesson = (id: string) => json<LessonWithIssues>(`/api/lessons/${id}`);

export const updateLesson = (lesson: Lesson) =>
	json<LessonWithIssues>(`/api/lessons/${lesson.id}`, {
		method: "PUT",
		body: JSON.stringify(lesson),
	});

/** Returns a rewrite for review; the server saves nothing until the editor's own save. */
export const reviseLesson = (id: string, body: ReviseRequest) =>
	json<LessonWithIssues>(`/api/lessons/${id}/revise`, { method: "POST", body: JSON.stringify(body) });

export async function deleteLesson(id: string): Promise<void> {
	await request(`/api/lessons/${id}`, { method: "DELETE" });
}

export function filenameFromDisposition(header: string | null): string {
	const utf8 = header && /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1];
	if (utf8) {
		try {
			return decodeURIComponent(utf8);
		} catch {
			// Malformed escape: use the plain filename below.
		}
	}
	return (header && /filename="([^"]+)"/i.exec(header)?.[1]) || "konspekt.docx";
}

/** The file needs the token, so it is fetched and handed to the browser as a blob. */
export async function downloadDocx(id: string): Promise<void> {
	const res = await request(`/api/lessons/${id}/docx`);
	const blob = await res.blob();
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filenameFromDisposition(res.headers.get("content-disposition"));
	link.click();
	URL.revokeObjectURL(link.href);
}
