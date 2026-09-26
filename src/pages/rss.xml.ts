import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

// RSS 里的 Markdown 由这里自带的 MarkdownIt 渲染，不认识 `:::ai-summary` 这类自定义指令，
// 会把块语法当纯文本吐出去，所以在渲染前先把整个块摘掉
// 闭合围栏的冒号数量只要求不少于开围栏，作者常写成 `::::::::::` 这类，
// 所以用 `:::+` 匹配，避免漏剥（漏剥会把整块摘要泄漏进 RSS）
const AI_SUMMARY_BLOCK_RE =
	/^[ \t]*:::ai-summary\{[^}]*\}[ \t]*\r?\n[\s\S]*?^[ \t]*:::+\s*(?:\r?\n|$)/gm;

function stripAiSummary(str: string): string {
	return str.replace(AI_SUMMARY_BLOCK_RE, "");
}

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(stripAiSummary(content));
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.slug}/`),
				content: sanitizeHtml(parser.render(cleanedContent), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		}),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
