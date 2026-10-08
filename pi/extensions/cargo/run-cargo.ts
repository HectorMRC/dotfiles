import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { combined, run } from "../lib/run-command.ts";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

export const manifestPath = Type.Optional(
	Type.String({ description: "Cargo.toml to use (default: found from the working directory)" }),
);

export const targetParams = {
	package: Type.Optional(Type.String({ description: "Only this package (-p); default: the whole workspace" })),
	manifestPath,
};

export function targetArgs(p: { package?: string; manifestPath?: string }) {
	return [
		...(p.manifestPath ? ["--manifest-path", p.manifestPath] : []),
		...(p.package ? ["-p", p.package] : ["--workspace"]),
	];
}

export async function cargoBuild(args: string[], ctx: ExtensionToolContext, signal?: AbortSignal) {
	const result = await run("cargo", args, { cwd: ctx.cwd, signal, env: { CARGO_TERM_COLOR: "never" } });
	const output = await limit(combined(result), "tail", `cargo-${args[0]}`);
	return { ...text(`exit ${result.code}\n\n${output}`), isError: result.code !== 0 };
}
