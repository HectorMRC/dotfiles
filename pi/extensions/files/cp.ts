import { cp, lstat } from "node:fs/promises";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "cp",
	label: "cp",
	description: "Copy a file or directory (directories need `recursive: true`).",
	parameters: Type.Object({
		source: Type.String(),
		destination: Type.String(),
		recursive: Type.Optional(Type.Boolean()),
	}),
	async execute(_id, p, _signal, _u, ctx) {
		const source = resolvePath(ctx.cwd, p.source);
		if ((await lstat(source)).isDirectory() && !p.recursive) {
			throw new Error(`${p.source} is a directory: set recursive: true.`);
		}
		await cp(source, resolvePath(ctx.cwd, p.destination), {
			recursive: true,
			errorOnExist: false,
			verbatimSymlinks: true,
		});
		return text(`Copied ${p.source} to ${p.destination}.`);
	},
});
