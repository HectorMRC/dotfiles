import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { fail, run } from "../lib/run-command.ts";

export function nix(args: string[], ctx: ExtensionToolContext, signal?: AbortSignal) {
	return run("nix", ["--extra-experimental-features", "nix-command flakes", ...args], { cwd: ctx.cwd, signal });
}

export async function nixOk(args: string[], ctx: ExtensionToolContext, signal?: AbortSignal) {
	const result = await nix(args, ctx, signal);
	if (result.code !== 0) fail(`nix ${args[0]}`, result);
	return result.stdout.trim();
}
