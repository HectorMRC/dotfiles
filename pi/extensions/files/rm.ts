import { lstat, rm } from "node:fs/promises";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "rm",
	label: "rm",
	description: "Delete a file or directory (directories need `recursive: true`).",
	annotations: { destructiveHint: true },
	parameters: Type.Object({ path: Type.String(), recursive: Type.Optional(Type.Boolean()) }),
	async execute(_id, p, _signal, _u, ctx) {
		const path = resolvePath(ctx.cwd, p.path);
		if ((await lstat(path)).isDirectory() && !p.recursive) {
			throw new Error(`${p.path} is a directory: set recursive: true.`);
		}
		await rm(path, { recursive: true });
		return text(`Deleted ${p.path}.`);
	},
});
