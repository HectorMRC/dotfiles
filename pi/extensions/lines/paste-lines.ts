import { defineTool, withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { exactlyOne, resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";
import { findBuffer } from "./line-buffers.ts";
import { load, save } from "./line-file.ts";

export default defineTool({
	name: "paste-lines",
	label: "paste lines",
	description:
		"Insert the contents of a named buffer (filled by an earlier copy-lines/cut-lines call) before or after a line of a file. The buffer is looked up in the session history and is not consumed, so it can be pasted repeatedly.",
	parameters: Type.Object({
		path: Type.String(),
		buffer: Type.String(),
		before: Type.Optional(Type.Integer({ minimum: 1, description: "Insert before this line" })),
		after: Type.Optional(
			Type.Integer({ minimum: 0, description: "Insert after this line; 0 is the start of the file" }),
		),
	}),
	async execute(_id, p, _signal, _u, ctx) {
		const where = exactlyOne(p, ["before", "after"]);
		const buffer = findBuffer(ctx, p.buffer);
		if (!buffer) throw new Error(`No buffer named "${p.buffer}" in this session.`);
		const path = resolvePath(ctx.cwd, p.path);
		return withFileMutationQueue(path, async () => {
			const { lines, trailingNewline } = await load(path);
			const index = where === "before" ? p.before! - 1 : p.after!;
			if (index > lines.length)
				throw new Error(`Line ${index} is past the end of the file (${lines.length} lines).`);
			lines.splice(index, 0, ...buffer);
			await save(path, lines, trailingNewline);
			return text(`Pasted ${buffer.length} lines at line ${index + 1} of ${p.path}.`);
		});
	},
});
