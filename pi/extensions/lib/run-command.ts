import { spawn } from "node:child_process";
import { truncateTail } from "@earendil-works/pi-coding-agent";

export interface RunResult {
	stdout: string;
	stderr: string;
	code: number;
}

export interface RunOptions {
	cwd: string;
	signal?: AbortSignal;
	timeoutMs?: number;
	env?: Record<string, string>;
}

// stdin is closed so nothing can prompt.
export function run(command: string, args: string[], options: RunOptions): Promise<RunResult> {
	return new Promise((resolvePromise, reject) => {
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		let killedReason: string | undefined;
		child.stdout.setEncoding("utf8").on("data", (chunk: string) => (stdout += chunk));
		child.stderr.setEncoding("utf8").on("data", (chunk: string) => (stderr += chunk));

		const kill = (reason: string) => {
			killedReason = reason;
			child.kill("SIGTERM");
			setTimeout(() => child.kill("SIGKILL"), 5000).unref();
		};
		const onAbort = () => kill("aborted");
		options.signal?.addEventListener("abort", onAbort, { once: true });
		const timer = options.timeoutMs
			? setTimeout(() => kill(`timed out after ${options.timeoutMs} ms`), options.timeoutMs)
			: undefined;

		child.on("error", (err: NodeJS.ErrnoException) => {
			options.signal?.removeEventListener("abort", onAbort);
			if (timer) clearTimeout(timer);
			reject(err.code === "ENOENT" ? new Error(`${command} is not installed or not in PATH`) : err);
		});
		child.on("close", (code) => {
			options.signal?.removeEventListener("abort", onAbort);
			if (timer) clearTimeout(timer);
			if (killedReason) reject(new Error(`${command} ${killedReason}`));
			else resolvePromise({ stdout, stderr, code: code ?? 1 });
		});
	});
}

export function combined({ stdout, stderr }: RunResult): string {
	return [stdout.trimEnd(), stderr.trimEnd()].filter(Boolean).join("\n");
}

export function fail(what: string, result: RunResult): never {
	const output = truncateTail(combined(result), { maxLines: 200, maxBytes: 20 * 1024 }).content;
	throw new Error(`${what} failed (exit ${result.code})${output ? `:\n${output}` : ""}`);
}
