import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { fail, run } from "../lib/run-command.ts";

export async function gh(args: string[], ctx: ExtensionToolContext, signal?: AbortSignal) {
	const result = await run("gh", args, { cwd: ctx.cwd, signal });
	if (result.code !== 0) fail(`gh ${args[0]}`, result);
	return result.stdout;
}
