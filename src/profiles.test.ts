import { expect, it } from "vitest";

import type { Profile } from "./api/types";
import { kindsOf, profileLabel, programs } from "./profiles";

const profile = (program: string, programName: string, kind: string, name: string): Profile => ({
	id: `${kind}-${program}`,
	program,
	program_name: programName,
	kind,
	name,
	blocks: [],
});

const PROFILES = [
	profile("3", "3 года", "complex", "Комплексное занятие"),
	profile("5-prep", "5 лет — промежуточная программа", "literacy", "Грамота и чтение"),
	profile("5-prep", "5 лет — промежуточная программа", "math", "Математика"),
];

it("lists each program once and the kinds of a program", () => {
	expect(programs(PROFILES)).toEqual([
		{ key: "3", name: "3 года" },
		{ key: "5-prep", name: "5 лет — промежуточная программа" },
	]);
	expect(kindsOf(PROFILES, "5-prep").map((p) => p.kind)).toEqual(["literacy", "math"]);
});

it("names the kind only where the program has several", () => {
	expect(profileLabel(PROFILES, "3", "complex")).toBe("3 года");
	expect(profileLabel(PROFILES, "5-prep", "math")).toBe(
		"5 лет — промежуточная программа, Математика"
	);
	expect(profileLabel(PROFILES, "gone", "complex")).toBe("gone");
});
