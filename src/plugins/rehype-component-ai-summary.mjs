/// <reference types="mdast" />
import fs from "node:fs";
import { createRequire } from "node:module";
import { h } from "hastscript";
import { aiSummaryConfig } from "../config";

// 图标数据在 build 期读取，图标集按仓库惯例放在 dependencies
//（material-symbols / fa6-brands / simple-icons 目前都是如此）
const require = createRequire(import.meta.url);

/** provider → 图标；未命中时回退到自绘通用图标，绝不臆造品牌 logo */
const PROVIDER_ICONS = {
	openai: "simple-icons:openai",
	anthropic: "simple-icons:anthropic",
	deepseek: "simple-icons:deepseek",
	googlegemini: "simple-icons:googlegemini",
	gemini: "simple-icons:googlegemini",
	google: "fa6-brands:google",
	qwen: "simple-icons:qwen",
	alibaba: "simple-icons:alibabacloud",
	bytedance: "simple-icons:bytedance",
	meta: "fa6-brands:meta",
	microsoft: "fa6-brands:microsoft",
	cloudflare: "fa6-brands:cloudflare",
	baidu: "fa6-brands:baidu",
	huggingface: "simple-icons:huggingface",
	ollama: "simple-icons:ollama",
	perplexity: "simple-icons:perplexity",
};

/** model 前缀 → 图标（provider 没写对时兜底） */
const MODEL_PREFIX_ICONS = {
	"gpt-": "simple-icons:openai",
	"o1-": "simple-icons:openai",
	"o3-": "simple-icons:openai",
	"o4-": "simple-icons:openai",
	"chatgpt-": "simple-icons:openai",
	"claude-": "simple-icons:anthropic",
	"deepseek-": "simple-icons:deepseek",
	"gemini-": "simple-icons:googlegemini",
	"qwen-": "simple-icons:qwen",
	"llama-": "fa6-brands:meta",
};

/** 读取 @iconify-json 里的图标，失败返回 null（交由调用方降级） */
function loadIcon(name) {
	if (typeof name !== "string" || !name.includes(":")) return null;
	const idx = name.indexOf(":");
	const prefix = name.slice(0, idx);
	const rest = name.slice(idx + 1);
	try {
		const dataPath = require.resolve(`@iconify-json/${prefix}/icons.json`);
		const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
		const icon = data?.icons?.[rest];
		if (!icon || typeof icon.body !== "string") return null;
		return {
			viewBox: `0 0 ${icon.width ?? data.width ?? 24} ${icon.height ?? data.height ?? 24}`,
			body: icon.body,
		};
	} catch {
		return null;
	}
}

/**
 * 解析厂商图标：先看 provider，再看 model 前缀。
 * 都没有命中时用自绘四角星（非任何品牌资产）。
 */
function resolveVendorIcon(provider, model) {
	const byProvider = PROVIDER_ICONS[String(provider ?? "").toLowerCase()];
	if (byProvider) {
		const icon = loadIcon(byProvider);
		if (icon) return icon;
	}

	const modelLower = String(model ?? "").toLowerCase();
	const prefix = Object.keys(MODEL_PREFIX_ICONS).find((p) =>
		modelLower.startsWith(p),
	);
	if (prefix) {
		const icon = loadIcon(MODEL_PREFIX_ICONS[prefix]);
		if (icon) return icon;
	}

	return {
		viewBox: "0 0 24 24",
		body: '<path fill="currentColor" d="M12 2c.4 0 .7.3.8.7l.9 3.8 3.8.9c.4.1.7.4.7.8s-.3.7-.7.8l-3.8.9-.9 3.8c-.1.4-.4.7-.8.7s-.7-.3-.8-.7l-.9-3.8-3.8-.9a.8.8 0 0 1 0-1.6l3.8-.9.9-3.8c.1-.4.4-.7.8-.7Z"/>',
	};
}

/** 把图标 body 组装成 svg hast 节点 */
function vendorIconNode(icon) {
	return {
		type: "element",
		tagName: "svg",
		properties: {
			className: ["ai-summary-vendor-icon"],
			width: "1em",
			height: "1em",
			viewBox: icon.viewBox,
			"aria-hidden": "true",
			focusable: "false",
		},
		children: [{ type: "raw", value: icon.body }],
	};
}

/** 头部自绘四角星 */
function sparkleNode() {
	return {
		type: "element",
		tagName: "span",
		properties: { className: ["ai-summary-sparkle"], "aria-hidden": "true" },
		children: [
			{
				type: "element",
				tagName: "svg",
				properties: {
					width: "1em",
					height: "1em",
					viewBox: "0 0 24 24",
					"aria-hidden": "true",
					focusable: "false",
				},
				children: [
					{
						type: "raw",
						value:
							'<path fill="currentColor" d="M12 2.2c.36 0 .68.25.77.6l1.05 4.03a3.2 3.2 0 0 0 2.35 2.35l4.03 1.05c.35.09.6.41.6.77s-.25.68-.6.77l-4.03 1.05a3.2 3.2 0 0 0-2.35 2.35l-1.05 4.03a.8.8 0 0 1-1.54 0l-1.05-4.03a3.2 3.2 0 0 0-2.35-2.35L3.85 11.8a.8.8 0 0 1 0-1.54l4.03-1.05a3.2 3.2 0 0 0 2.35-2.35l1.05-4.03c.09-.35.41-.6.77-.6Zm6.1 11.3c.2 0 .38.14.43.34l.42 1.6a1.6 1.6 0 0 0 1.15 1.15l1.6.42c.2.05.34.24.34.43s-.14.38-.34.43l-1.6.42a1.6 1.6 0 0 0-1.15 1.15l-.42 1.6a.47.47 0 0 1-.9 0l-.42-1.6a1.6 1.6 0 0 0-1.15-1.15l-1.6-.42a.47.47 0 0 1 0-.9l1.6-.42a1.6 1.6 0 0 0 1.15-1.15l.42-1.6a.47.47 0 0 1 .44-.35Z"/>',
					},
				],
			},
		],
	};
}

/** 首屏同步 arm，避免 Swup 换入新卡片时先闪一下全文 */
function armScriptNode() {
	return {
		type: "element",
		tagName: "script",
		properties: { type: "text/javascript" },
		children: [
			{
				type: "text",
				value:
					'var c=document.currentScript;c&&c.closest(".ai-summary")&&c.closest(".ai-summary").classList.add("is-armed")',
			},
		],
	};
}

/**
 * 创建 AI 总结卡片。
 * 摘要文本来自作者手写在 markdown 里的块体（静态 HTML，可被 SEO / pagefind 索引）。
 *
 * @param {Object} properties - directive 属性：model / provider / updated
 * @param {import('mdast').RootContent[]} children - 块体 children，与 admonition 的 `...children` 同构
 * @returns {import('hast').Element} 总结卡片节点
 */
export function AiSummaryComponent(properties, children) {
	if (!aiSummaryConfig.enable) {
		return null;
	}

	const model = properties?.model ? String(properties.model) : "";
	const provider = properties?.provider ? String(properties.provider) : "";
	const updated = properties?.updated ? String(properties.updated) : "";
	// 脚注标签由 remark 插件按文章 lang 生成，缺省时保持中文
	const updatedLabel = properties?.updatedLabel
		? String(properties.updatedLabel)
		: "更新于";

	const icon = resolveVendorIcon(provider, model);
	const hasFooterInfo =
		aiSummaryConfig.showFooter && Boolean(model || provider || updated);

	const header = h("div.ai-summary-header", [
		sparkleNode(),
		h("span.ai-summary-title", aiSummaryConfig.title),
	]);

	// 正文：作者手写的摘要，始终完整存在于 HTML
	const body = h("div.ai-summary-body.text-75", [...(children || [])]);

	// 脚注：播放结束后由 JS 摘掉 is-armed / is-playing 才显示
	// 用 CSS 类控制可见性而非 hidden 属性 —— 这样禁用 JS 时内容依然可读
	const footer = h(
		"div.ai-summary-footer",
		[
			vendorIconNode(icon),
			model ? h("span.ai-summary-model", model) : null,
			updated
				? h("span.ai-summary-updated", `${updatedLabel} ${updated}`)
				: null,
		].filter(Boolean),
	);

	const props = {
		"data-ai-summary": "",
		"data-ai-chars-per-second": String(aiSummaryConfig.charsPerSecond),
	};
	if (hasFooterInfo) {
		props["data-ai-model"] = model || undefined;
		props["data-ai-provider"] = provider || undefined;
		props["data-ai-updated"] = updated || undefined;
	} else {
		props["data-ai-footer-empty"] = "";
	}

	return h("div.ai-summary", props, [header, body, footer, armScriptNode()]);
}
