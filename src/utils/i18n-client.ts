import { getTranslation } from "../i18n/translation";

const STORAGE_KEY = "lang";
const DEFAULT_LANG = "zh_CN";
const SUPPORTED = ["zh_CN", "en"];

type Dict = Record<string, string>;

export function getCurrentLang(): string {
	if (typeof localStorage === "undefined") return DEFAULT_LANG;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && SUPPORTED.includes(stored) ? stored : DEFAULT_LANG;
}

function translateEl(el: HTMLElement, lang: string) {
	const dict = getTranslation(lang) as Dict;
	const key = el.dataset.i18n;
	if (key !== undefined) {
		const text = dict[key];
		if (text !== undefined) el.textContent = text;
	}
	const phKey = el.dataset.i18nPlaceholder;
	if (phKey !== undefined) {
		const text = dict[phKey];
		if (text !== undefined) el.setAttribute("placeholder", text);
	}
}

let currentLang = getCurrentLang();

function updateLangLabel() {
	const el = document.getElementById("lang-label");
	if (el) el.textContent = currentLang === "zh_CN" ? "中" : "EN";
}

export function applyLang(lang: string) {
	if (SUPPORTED.includes(lang)) currentLang = lang;
	if (typeof localStorage !== "undefined") {
		localStorage.setItem(STORAGE_KEY, currentLang);
	}
	if (typeof document !== "undefined") {
		document.documentElement.lang = currentLang.replace("_", "-");
		document
			.querySelectorAll<HTMLElement>("[data-i18n],[data-i18n-placeholder]")
			.forEach((el) => translateEl(el, currentLang));
	}
	updateLangLabel();
}

export function toggleLang(): string {
	applyLang(currentLang === "zh_CN" ? "en" : "zh_CN");
	return currentLang;
}

export function initI18n() {
	applyLang(currentLang);
	if (typeof document === "undefined") return;
	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			m.addedNodes.forEach((node) => {
				if (!(node instanceof HTMLElement)) return;
				if (node.matches("[data-i18n],[data-i18n-placeholder]")) {
					translateEl(node, currentLang);
				}
				node
					.querySelectorAll("[data-i18n],[data-i18n-placeholder]")
					.forEach((el) => translateEl(el as HTMLElement, currentLang));
			});
		}
	});
	observer.observe(document.documentElement, { childList: true, subtree: true });
}
