const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	para: "",
	copy: "(c)",
	mdash: "-",
	ndash: "-",
	hellip: "...",
	lsquo: "'",
	rsquo: "'",
	ldquo: '"',
	rdquo: '"',
};

function decodeEntities(s: string): string {
	return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
		if (e[0] === "#") {
			const code = e[1] === "x" || e[1] === "X" ? Number.parseInt(e.slice(2), 16) : Number(e.slice(1));
			return Number.isFinite(code) ? String.fromCodePoint(code) : m;
		}
		return ENTITIES[e.toLowerCase()] ?? m;
	});
}

export function htmlToMarkdown(html: string, base: string): string {
	let s = html
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<(script|style|noscript|svg|head|nav|footer|iframe|template)\b[\s\S]*?<\/\1>/gi, "");
	const main = s.match(/<(main|article)\b[\s\S]*<\/\1>/i);
	if (main) s = main[0];
	s = s
		.replace(
			/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi,
			(_, c: string) => `\n\n\`\`\`\n${c.replace(/<[^>]+>/g, "")}\n\`\`\`\n\n`,
		)
		.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, c: string) => `\`${c.replace(/<[^>]+>/g, "")}\``)
		.replace(
			/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
			(_, n: string, c: string) => `\n\n${"#".repeat(Number(n))} ${c}\n\n`,
		)
		.replace(/<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, c: string) => {
			let url = href;
			try {
				url = new URL(decodeEntities(href), base).href;
			} catch {}
			const label = c.replace(/<[^>]+>/g, "").trim();
			return label ? `[${label}](${url})` : "";
		})
		.replace(/<li\b[^>]*>/gi, "\n- ")
		.replace(/<(br|hr)\b[^>]*>/gi, "\n")
		.replace(/<\/?(p|div|section|ul|ol|table|tr|blockquote|header|dl|dt|dd)\b[^>]*>/gi, "\n\n")
		.replace(/<\/t[dh]>/gi, " | ")
		.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
		.replace(/<[^>]+>/g, "");
	return decodeEntities(s)
		.split("\n")
		.map((l) => l.replace(/[ \t]+/g, " ").trim())
		.join("\n")
		.replace(/^-\n+/gm, "- ")
		.replace(/^- *$/gm, "")
		.replace(/\[\]\([^)]*\)/g, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
