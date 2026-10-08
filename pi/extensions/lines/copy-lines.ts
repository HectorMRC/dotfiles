import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { bufferRangeParams } from "./line-buffers.ts";
import { load, range } from "./line-file.ts";

export default defineTool({
	name: "copy-lines",
	label: "copy lines",
	description:
		"Copy a 1-indexed inclusive line range from a file into a named buffer (stored in the session history) for later paste-lines. Read-only: the file is not modified.",
	annotations: READ_ONLY,
	parameters: Type.Object(bufferRangeParams),
	async execute(_id, p, _signal, _u, ctx) {
		const { lines } = await load(resolvePath(ctx.cwd, p.path));
		const copied = range(lines, p.start, p.end);
		return text(`Copied ${copied.length} lines into buffer "${p.buffer}".`, { buffer: p.buffer, lines: copied });
	},
});
