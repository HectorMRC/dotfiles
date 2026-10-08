import type { Message } from "@earendil-works/pi-ai";
import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";

const MODELS: [string, string][] = [
	["anthropic", "claude-haiku-4-5"],
	["anthropic", "claude-3-5-haiku-latest"],
];
const MAX_PAGE_CHARS = 400_000;

const SYSTEM_PROMPT =
	"Answer the question using only the given web page. Be concise and quote exact text, code or numbers when relevant. Say so if the page does not contain the answer.";

export async function askAboutPage(
	ctx: ExtensionToolContext,
	url: string,
	page: string,
	question: string,
	signal?: AbortSignal,
) {
	const model = MODELS.map(([provider, id]) => ctx.modelRegistry.find(provider, id)).find(Boolean) ?? ctx.model;
	if (!model) throw new Error("No model available to answer the prompt.");
	const message: Message = {
		role: "user",
		content: [
			{
				type: "text",
				text: `Content of ${url}:\n\n<page>\n${page.slice(0, MAX_PAGE_CHARS)}\n</page>\n\n${question}`,
			},
		],
		timestamp: Date.now(),
	};
	const response = await ctx.modelRegistry.complete(
		model,
		{ systemPrompt: SYSTEM_PROMPT, messages: [message] },
		{ signal },
	);
	if (response.stopReason === "error") {
		throw new Error(`Model call failed: ${response.errorMessage ?? "unknown error"}`);
	}
	const reply = response.content.flatMap((c) => (c.type === "text" ? [c.text] : [])).join("\n");
	return { reply, usage: response.usage };
}
