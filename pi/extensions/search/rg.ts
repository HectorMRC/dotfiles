import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { fail, run } from "../lib/run-command.ts";
import { list, stringOrList } from "../lib/tool-params.ts";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

export default defineTool({
	name: "rg",
	label: "rg",
	description:
		"Search file contents with ripgrep. Respects .gitignore by default. Read-only. Prefer fixedStrings=true for literal text.",
	annotations: READ_ONLY,
	parameters: Type.Object({
		pattern: Type.String({ description: "Regex (Rust syntax), or literal text with fixedStrings" }),
		path: stringOrList("Files or directories to search (default: .)"),
		glob: stringOrList("Include globs like '*.ts'; prefix '!' to exclude"),
		fixedStrings: Type.Optional(Type.Boolean({ description: "Treat pattern as literal text" })),
		ignoreCase: Type.Optional(Type.Boolean()),
		context: Type.Optional(Type.Integer({ minimum: 0, description: "Lines of context around each match" })),
		filesWithMatches: Type.Optional(Type.Boolean({ description: "Only list matching file paths" })),
		hidden: Type.Optional(Type.Boolean({ description: "Search hidden files" })),
		noIgnore: Type.Optional(Type.Boolean({ description: "Ignore .gitignore and other ignore files" })),
	}),
	async execute(_id, p, signal, _onUpdate, ctx) {
		const args = [
			"--color=never",
			"--with-filename",
			"--line-number",
			"--max-columns=500",
			"--max-columns-preview",
		];
		if (p.fixedStrings) args.push("--fixed-strings");
		if (p.ignoreCase) args.push("--ignore-case");
		if (p.context) args.push(`--context=${p.context}`);
		if (p.filesWithMatches) args.push("--files-with-matches");
		if (p.hidden) args.push("--hidden");
		if (p.noIgnore) args.push("--no-ignore");
		for (const g of list(p.glob)) args.push(`--glob=${g}`);
		args.push("--", p.pattern, ...list(p.path));

		const result = await run("rg", args, { cwd: ctx.cwd, signal });
		if (result.code === 1 && !result.stderr) return text("No matches found");
		if (result.code !== 0 && !result.stdout) fail("rg", result);
		let output = await limit(result.stdout.trimEnd(), "head", "rg");
		if (result.stderr) output += `\n\n[rg errors]\n${result.stderr.trimEnd()}`;
		return text(output);
	},
});
