import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { combined, fail, run } from "../lib/run-command.ts";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

export async function jj(
	args: string[],
	ctx: ExtensionToolContext,
	signal?: AbortSignal,
	keep: "head" | "tail" = "head",
) {
	const result = await run("jj", ["--no-pager", "--color=never", ...args], {
		cwd: ctx.cwd,
		signal,
		env: { JJ_EDITOR: "false" },
	});
	if (result.code !== 0) fail(`jj ${args[0]}`, result);
	const output = combined(result);
	return text(output ? await limit(output, keep, `jj-${args[0]}`) : `jj ${args[0]}: done`);
}

// So conflicts are visible.
export async function jjWithLog(args: string[], ctx: ExtensionToolContext, signal?: AbortSignal) {
	const result = await jj(args, ctx, signal, "tail");
	const log = await jj(["log", "-r", "trunk()..@ | @", "-n", "20"], ctx, signal);
	return text(`${result.content[0].text}\n\n${log.content[0].text}`);
}
