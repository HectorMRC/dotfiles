import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { fail, run } from "../lib/run-command.ts";
import { list, stringOrList } from "../lib/tool-params.ts";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

export default defineTool({
	name: "fd",
	label: "fd",
	description:
		"Find files/directories by name using fd. Respects .gitignore by default. Read-only. Set glob=true for shell-style patterns.",
	annotations: READ_ONLY,
	parameters: Type.Object({
		pattern: Type.Optional(
			Type.String({ description: "Regex matched against the file name (default: everything)" }),
		),
		path: stringOrList("Directories to search (default: .)"),
		glob: Type.Optional(Type.Boolean({ description: "Treat pattern as a glob, e.g. '*.nix'" })),
		type: Type.Optional(Type.Union([Type.Literal("file"), Type.Literal("directory"), Type.Literal("symlink")])),
		extension: stringOrList("Only these file extensions, without the dot"),
		maxDepth: Type.Optional(Type.Integer({ minimum: 1 })),
		hidden: Type.Optional(Type.Boolean({ description: "Include hidden files" })),
		noIgnore: Type.Optional(Type.Boolean({ description: "Ignore .gitignore and other ignore files" })),
	}),
	async execute(_id, p, signal, _onUpdate, ctx) {
		const args = ["--color=never", "--max-results=1000"];
		if (p.glob && p.pattern !== undefined) args.push("--glob");
		if (p.type) args.push(`--type=${p.type[0]}`);
		if (p.maxDepth) args.push(`--max-depth=${p.maxDepth}`);
		if (p.hidden) args.push("--hidden");
		if (p.noIgnore) args.push("--no-ignore");
		for (const e of list(p.extension)) args.push(`--extension=${e}`);
		args.push("--", p.pattern ?? ".", ...list(p.path));

		const result = await run("fd", args, { cwd: ctx.cwd, signal });
		if (result.code !== 0) fail("fd", result);
		const output = result.stdout.trimEnd();
		return text(output ? await limit(output, "head", "fd") : "No files found");
	},
});
