import { cp, mkdir, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "mv",
	label: "mv",
	description:
		"Move or rename a file or directory. Works across filesystems; missing parent directories of the destination are created.",
	annotations: { destructiveHint: true },
	parameters: Type.Object({ source: Type.String(), destination: Type.String() }),
	async execute(_id, p, _signal, _u, ctx) {
		const source = resolvePath(ctx.cwd, p.source);
		const destination = resolvePath(ctx.cwd, p.destination);
		await mkdir(dirname(destination), { recursive: true });
		try {
			await rename(source, destination);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
			await cp(source, destination, { recursive: true, verbatimSymlinks: true });
			await rm(source, { recursive: true });
		}
		return text(`Moved ${p.source} to ${p.destination}.`);
	},
});
