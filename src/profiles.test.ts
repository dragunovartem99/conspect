import { expect, it } from "vitest";

import type { Profile } from "./api/types";
import { ageLabel, ages, kindsOf, profileLabel } from "./profiles";

const profile = (age: number, kind: string, name: string): Profile => ({
	id: `${kind}-${age}`,
	age,
	kind,
	name,
	blocks: [],
});

const PROFILES = [
	profile(3, "complex", "Комплексное занятие"),
	profile(5, "literacy", "Грамота"),
	profile(5, "math", "Математика"),
];

it("names ages in Russian", () => {
	expect([1, 3, 4, 5, 11, 21, 22].map((age) => ageLabel(age))).toEqual([
		"1 год",
		"3 года",
		"4 года",
		"5 лет",
		"11 лет",
		"21 год",
		"22 года",
	]);
});

it("lists each age once and the kinds of an age", () => {
	expect(ages(PROFILES)).toEqual([3, 5]);
	expect(kindsOf(PROFILES, 5).map((p) => p.kind)).toEqual(["literacy", "math"]);
});

it("names the kind only where the age has several", () => {
	expect(profileLabel(PROFILES, 3, "complex")).toBe("3 года");
	expect(profileLabel(PROFILES, 5, "math")).toBe("5 лет, Математика");
});
