import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ApiError, filenameFromDisposition, getLesson, login } from "./client";
import { clearToken, getToken, subscribeToken } from "./token";

function stubFetch(status: number, body: unknown) {
	const fetchMock = vi.fn<() => Promise<Response>>(
		async () => new Response(JSON.stringify(body), { status })
	);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

const headersOf = (fetchMock: ReturnType<typeof stubFetch>) =>
	(fetchMock.mock.calls[0] as unknown as [Request])[0].headers;

beforeEach(() => clearToken());
afterEach(() => vi.unstubAllGlobals());

it("stores the token from a login and sends it afterwards", async () => {
	stubFetch(200, { token: "t0k" });
	await login("secret");
	expect(getToken()).toBe("t0k");

	const fetchMock = stubFetch(200, { lesson: {}, issues: [] });
	await getLesson("abc");
	expect(headersOf(fetchMock).get("authorization")).toBe("Bearer t0k");
});

it("does not send a token to the login route", async () => {
	stubFetch(200, { token: "t0k" });
	await login("secret");
	const fetchMock = stubFetch(401, { detail: "Wrong password." });
	await expect(login("nope")).rejects.toMatchObject({ status: 401 });
	expect(headersOf(fetchMock).get("authorization")).toBeNull();
});

it("signs out when the server rejects the token", async () => {
	stubFetch(200, { token: "t0k" });
	await login("secret");
	const signedOut = vi.fn<() => void>();
	const stop = subscribeToken(signedOut);

	stubFetch(401, { detail: "Sign in required." });
	await expect(getLesson("abc")).rejects.toBeInstanceOf(ApiError);
	expect(signedOut).toHaveBeenCalledOnce();
	expect(getToken()).toBeNull();
	stop();
});

it("says so when the password is wrong", async () => {
	stubFetch(401, { detail: "Wrong password." });
	await expect(login("nope")).rejects.toThrow("Неверный пароль.");
});

it("shows the server's message, and a Russian one when the server is unreachable", async () => {
	stubFetch(502, { detail: "Claude API rate limit reached." });
	await expect(getLesson("abc")).rejects.toThrow("Claude API rate limit reached.");

	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
	await expect(getLesson("abc")).rejects.toMatchObject({
		status: 0,
		message: expect.stringContaining("Нет связи"),
	});
});

it("reads the download name from Content-Disposition", () => {
	const header = `attachment; filename="konspekt_5.docx"; filename*=UTF-8''konspekt_5_%D0%9E%D0%B2%D0%BE%D1%89%D0%B8.docx`;
	expect(filenameFromDisposition(header)).toBe("konspekt_5_Овощи.docx");
	expect(filenameFromDisposition('attachment; filename="konspekt_5.docx"')).toBe(
		"konspekt_5.docx"
	);
	expect(filenameFromDisposition(null)).toBe("konspekt.docx");
	expect(filenameFromDisposition("attachment; filename*=UTF-8''%E0%A4%A")).toBe("konspekt.docx");
});
