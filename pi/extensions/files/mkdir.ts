import { mkdir } from "node:fs/promises";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "mkdir",
	label: "mkdir",
	description: "Create a directory. By default parents are created and an existing target is not an error.",
	annotations: { destructiveHint: false, idempotentHint: true },
	parameters: Type.Object({
		path: Type.String(),
		parents: Type.Optional(Type.Boolean({ description: "Create missing parents (default true)" })),
	}),
	async execute(_id, p, _signal, _u, ctx) {
		await mkdir(resolvePath(ctx.cwd, p.path), { recursive: p.parents ?? true });
		return text(`Created ${p.path}.`);
	},
});
