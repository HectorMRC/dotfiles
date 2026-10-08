import { defineTool, withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";
import { bufferRangeParams } from "./line-buffers.ts";
import { load, range, save } from "./line-file.ts";

export default defineTool({
	name: "cut-lines",
	label: "cut lines",
	description:
		"Cut a 1-indexed inclusive line range out of a file into a named buffer (stored in the session history) for later paste-lines. The lines are removed from the file.",
	parameters: Type.Object(bufferRangeParams),
	async execute(_id, p, _signal, _u, ctx) {
		const path = resolvePath(ctx.cwd, p.path);
		return withFileMutationQueue(path, async () => {
			const { lines, trailingNewline } = await load(path);
			const cut = range(lines, p.start, p.end);
			lines.splice(p.start - 1, cut.length);
			await save(path, lines, trailingNewline);
			return text(`Cut ${cut.length} lines into buffer "${p.buffer}".`, { buffer: p.buffer, lines: cut });
		});
	},
});
