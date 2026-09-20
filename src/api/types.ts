import type { components } from "./schema";

type Schemas = components["schemas"];

export type Lesson = Schemas["Lesson"];
export type Section = Schemas["Section"];
export type SectionKind = Section["kind"];
export type Issue = Schemas["Issue"];
export type LessonWithIssues = Schemas["LessonWithIssues"];
export type LessonSummary = Schemas["LessonSummary"];
export type GenerateRequest = Schemas["GenerateRequest"];
