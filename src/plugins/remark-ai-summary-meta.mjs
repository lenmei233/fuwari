import { visit } from "unist-util-visit";
/**
 * 为 `:::ai-summary{...}` 指令补齐 `updated` 属性与 `updatedLabel`。
 *
 * 文章的最后更新时间由 frontmatter 的 updated 决定，缺失时回落到 published；
 * 这样作者写块时只需提供 model / provider，无需手写日期。
 * 脚注里的「更新于 / Updated on」按文章 frontmatter 的 lang 选择，作者显式写了就以作者为准。
 *
 * 必须放在 remarkDirective 之后（此时节点类型已是 containerDirective），
 * 且在 parseDirectiveNode 之前（该插件会把节点转成 hast）。
 */

export function remarkAiSummaryMeta() {
	return (tree, file) => {
		const frontmatter = file.data.astro?.frontmatter ?? {};
		const updated = frontmatter.updated ?? frontmatter.published;
		// 英文文章用英文标签，其余保持中文
		const lang = String(frontmatter.lang ?? "").toLowerCase();
		const defaultLabel = lang.startsWith("en") ? "Updated on" : "更新于";

		visit(tree, (node) => {
			if (
				node.type !== "containerDirective" ||
				node.name !== "ai-summary" ||
				!updated
			) {
				return;
			}

			// 与站点 formatDateToYYYYMMDD 保持同一种 YYYY-MM-DD 表示
			const date = new Date(updated).toISOString().slice(0, 10);

			node.attributes = node.attributes || {};
			// 作者显式写了就以作者为准
			if (!node.attributes.updated) {
				node.attributes.updated = date;
			}
			if (!node.attributes.updatedLabel) {
				node.attributes.updatedLabel = defaultLabel;
			}
		});
	};
}
