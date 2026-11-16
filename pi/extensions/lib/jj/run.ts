import { combined, fail, run } from "../run-command.ts";
import { text } from "../tool-result.ts";
import { limit } from "../truncate-output.ts";

export async function jj(args: string[], cwd: string, signal?: AbortSignal, keep: "head" | "tail" = "head") {
	const result = await run("jj", ["--no-pager", "--color=never", ...args], {
		cwd,
		signal,
		env: { JJ_EDITOR: "false" },
	});
	if (result.code !== 0) fail(`jj ${args[0]}`, result);
	const output = combined(result);
	return text(output ? await limit(output, keep, `jj-${args[0]}`) : `jj ${args[0]}: done`);
}

export async function jjOutput(args: string[], cwd: string, signal?: AbortSignal): Promise<string> {
	const result = await run("jj", ["--no-pager", "--color=never", ...args], { cwd, signal });
	if (result.code !== 0) fail(`jj ${args[0]}`, result);
	return result.stdout.trim();
}

// So conflicts are visible.
export async function jjWithLog(args: string[], cwd: string, signal?: AbortSignal) {
	const result = await jj(args, cwd, signal, "tail");
	const log = await jj(["log", "-r", "trunk()..@ | @", "-n", "20"], cwd, signal);
	return text(`${result.content[0].text}\n\n${log.content[0].text}`);
}
