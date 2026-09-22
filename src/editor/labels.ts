import type { SectionKind } from "../api/types";

export const MONTHS = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];

export const KIND_LABELS: Record<SectionKind, string> = {
	ritual: "Ритуал приветствия",
	surprise: "Сюрпризный момент",
	game: "Игра",
	physical_minute: "Физкультминутка",
	finger_gymnastics: "Пальчиковая гимнастика",
	classwork: "Классная работа",
	summary: "Итог занятия",
	reflection: "Рефлексия",
	other: "Другое",
};
