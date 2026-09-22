import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { clearToken, getToken, setToken } from "./token";
import type { GenerateRequest, Lesson, ReviseRequest } from "./types";

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

/** Text to show for any error thrown by the calls below (or anything else). */
export const message = (e: unknown): string => (e instanceof Error ? e.message : "Что-то пошло не так.");

const api = createClient<paths>({
	baseUrl: API_URL,
	// Looked up on each call rather than captured once, so tests can stub it.
	fetch: (request) => globalThis.fetch(request),
});

api.use({
	onRequest({ request, schemaPath }) {
		const token = getToken();
		if (token && schemaPath !== "/api/login") request.headers.set("authorization", `Bearer ${token}`);
		return request;
	},
	onResponse({ request, response }) {
		// The server rejected the stored token: signing out shows the login screen.
		if (response.status === 401 && request.headers.has("authorization")) clearToken();
	},
	onError() {
		return new ApiError(0, "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
	},
});

function detail(error: unknown, status: number): string {
	if (typeof error === "object" && error && "detail" in error && typeof error.detail === "string") {
		return error.detail;
	}
	return status === 422 ? "Проверьте введённые данные." : `Ошибка сервера (${status}).`;
}

/** The response body, or an ApiError with the server's message. */
async function unwrap<T>(pending: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
	const { data, error, response } = await pending;
	if (!response.ok) throw new ApiError(response.status, detail(error, response.status));
	return data as T;
}

const lessonPath = (id: string) => ({ params: { path: { lesson_id: id } } });

export async function login(password: string): Promise<void> {
	try {
		const { token } = await unwrap(api.POST("/api/login", { body: { password } }));
		setToken(token);
	} catch (e) {
		throw e instanceof ApiError && e.status === 401 ? new ApiError(401, "Неверный пароль.") : e;
	}
}

export const logout = clearToken;

export const listLessons = () => unwrap(api.GET("/api/lessons"));

export const generateLesson = (body: GenerateRequest) => unwrap(api.POST("/api/lessons/generate", { body }));

export const getLesson = (id: string) => unwrap(api.GET("/api/lessons/{lesson_id}", lessonPath(id)));

export const updateLesson = (lesson: Lesson) =>
	unwrap(api.PUT("/api/lessons/{lesson_id}", { ...lessonPath(lesson.id), body: lesson }));

/** Returns a rewrite for review; the server saves nothing until the editor's own save. */
export const reviseLesson = (id: string, body: ReviseRequest) =>
	unwrap(api.POST("/api/lessons/{lesson_id}/revise", { ...lessonPath(id), body }));

export async function deleteLesson(id: string): Promise<void> {
	await unwrap(api.DELETE("/api/lessons/{lesson_id}", lessonPath(id)));
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

/** The file needs the token, so it is fetched as a blob rather than linked to. */
export async function getDocx(id: string): Promise<{ blob: Blob; filename: string }> {
	const pending = api.GET("/api/lessons/{lesson_id}/docx", { ...lessonPath(id), parseAs: "blob" });
	const blob = await unwrap(pending);
	const { response } = await pending;
	return { blob, filename: filenameFromDisposition(response.headers.get("content-disposition")) };
}
