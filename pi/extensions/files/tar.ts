import { isAbsolute, normalize } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { cachePath } from "../lib/cache-dir.ts";
import { fail, run } from "../lib/run-command.ts";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "tar",
	label: "tar",
	description:
		"Bundle files from one base directory into a tar archive, written to a pre-allowed cache directory (the returned path can be read or uploaded directly). Members are given relative to the base directory and keep their on-disk structure; directories are added recursively.",
	annotations: { destructiveHint: false },
	parameters: Type.Object({
		baseDirectory: Type.String({ description: "Directory the members are relative to" }),
		members: Type.Array(Type.String(), { minItems: 1, description: "Relative paths of files or directories" }),
		name: Type.Optional(Type.String({ description: "Archive file name (default archive.tar.gz)" })),
		compress: Type.Optional(Type.Boolean({ description: "gzip the archive (default true)" })),
	}),
	async execute(_id, p, signal, _u, ctx) {
		for (const m of p.members) {
			if (isAbsolute(m) || normalize(m).startsWith("..")) {
				throw new Error(`Member ${m} must be relative to the base directory.`);
			}
		}
		const compress = p.compress ?? true;
		const name = (p.name ?? (compress ? "archive.tar.gz" : "archive.tar")).replace(/[/\\]/g, "_");
		const archive = await cachePath(name);
		const base = resolvePath(ctx.cwd, p.baseDirectory);
		const result = await run("tar", [compress ? "-czf" : "-cf", archive, "-C", base, "--", ...p.members], {
			cwd: ctx.cwd,
			signal,
		});
		if (result.code !== 0) fail("tar", result);
		return text(`Archive written to ${archive}`, { path: archive });
	},
});
