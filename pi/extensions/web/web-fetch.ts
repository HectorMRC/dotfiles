import { basename } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { cacheFile } from "../lib/cache-dir.ts";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";
import { askAboutPage } from "./ask-about-page.ts";
import { htmlToMarkdown } from "./html-to-markdown.ts";

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) pi-web-fetch";

export default defineTool({
	name: "web-fetch",
	label: "web fetch",
	description:
		"Fetch a web page and return its content. Set 'prompt' to ask a question about the page. Large or binary results come back as a cache file path to read.",
	annotations: { readOnlyHint: true, openWorldHint: true },
	parameters: Type.Object({
		url: Type.String({ description: "http(s) URL" }),
		prompt: Type.Optional(Type.String({ description: "Question to answer from the page instead of returning it" })),
		raw: Type.Optional(Type.Boolean({ description: "Return HTML as is instead of converting it to Markdown" })),
	}),
	async execute(_id, p, signal, _u, ctx) {
		if (!/^https?:\/\//i.test(p.url)) throw new Error("Only http(s) URLs are supported.");
		const response = await fetch(p.url, {
			signal,
			redirect: "follow",
			headers: { "User-Agent": USER_AGENT, Accept: "text/html,text/markdown,text/plain,*/*;q=0.8" },
		}).catch((err: Error) => {
			throw new Error(`Fetching ${p.url} failed: ${(err.cause as Error | undefined)?.message ?? err.message}`);
		});
		if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText} for ${response.url}`);

		const type = response.headers.get("content-type") ?? "";
		if (!/^text\/|json|xml|javascript|yaml|toml/i.test(type)) {
			const name = basename(new URL(response.url).pathname) || "download";
			const path = await cacheFile(name, new Uint8Array(await response.arrayBuffer()));
			return text(`Binary content (${type || "unknown type"}) saved to ${path}`, { path });
		}

		const body = await response.text();
		const page = /html/i.test(type) && !p.raw ? htmlToMarkdown(body, response.url) : body;
		if (p.prompt) {
			const { reply, usage } = await askAboutPage(ctx, response.url, page, p.prompt, signal);
			return { ...text(reply), usage };
		}
		return text(await limit(page, "head", "web-fetch"));
	},
});
