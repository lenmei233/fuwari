import type {
	AiSummaryConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "lenmei233's Blog",
	subtitle: "技术分享与日常记录",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: "/images/avatar.png", // Path of the favicon, relative to the /public directory
			sizes: "any", // (Optional) Size of the favicon; "any" works for all sizes and both light/dark modes
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "友链",
			url: "/friends/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		{
			name: "统计",
			url: "https://analytics.lenmei233.top/", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
		{
			name: "状态",
			url: "https://status1.lenmei233.top/", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "lenmei233",
	bio: "A person who loves coding , Welcome to my blog!",
	links: [
		{
			name: "QQ",
			icon: "fa6-brands:qq", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://blog.lenmei233.top/web/add_qq",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:lenmei233@vip.qq.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/lenmei233",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const aiSummaryConfig: AiSummaryConfig = {
	// 文章正文开头的 AI 总结卡片。摘要内容由作者手动写在 markdown 里：
	//   :::ai-summary{model="deepseek-chat" provider="deepseek"}
	//   摘要正文……
	//   :::
	enable: true,
	title: "AI 总结",
	// 脚注会展示：厂商图标 + 模型名 + 文章最后更新时间
	// （updated 由插件从 frontmatter 自动补齐，无需手写）
	showFooter: true,
	// 流式播放速度，约 320 字/秒，100 字摘要约 0.3 秒播完
	charsPerSecond: 320,
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
export const commentConfig: CommentConfig = {
	waline: {
		serverURL: "https://waline.lenmei233.top",

		login: "enable",
	},
};
