import { DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES, truncateHead, truncateTail } from "@earendil-works/pi-coding-agent";
import { cacheFile } from "./cache-dir.ts";

export async function limit(output: string, keep: "head" | "tail", label = "output"): Promise<string> {
	const options = { maxLines: DEFAULT_MAX_LINES, maxBytes: DEFAULT_MAX_BYTES };
	const t = keep === "head" ? truncateHead(output, options) : truncateTail(output, options);
	if (!t.truncated) return output;
	const path = await cacheFile(`${label}.txt`, output);
	const notice = `[Truncated: showing ${keep === "head" ? "first" : "last"} ${t.outputLines} of ${t.totalLines} lines. Full output: ${path}]`;
	return keep === "head" ? `${t.content}\n\n${notice}` : `${notice}\n\n${t.content}`;
}
