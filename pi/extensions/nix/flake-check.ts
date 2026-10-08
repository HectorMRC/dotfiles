import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";
import { nix, nixOk } from "./run-nix.ts";

export default defineTool({
	name: "nix-flake-check",
	label: "nix flake check",
	description:
		"List or run the flake's checks. Omit `check` to list check names. On failure returns the tail of the build log (with the failing drv path for nix-log); on success the drv and out store paths.",
	parameters: Type.Object({ check: Type.Optional(Type.String({ description: "Check name to build" })) }),
	async execute(_id, p, signal, _u, ctx) {
		const system = await nixOk(["eval", "--impure", "--raw", "--expr", "builtins.currentSystem"], ctx, signal);
		if (!p.check) {
			const names = await nixOk(
				["eval", `.#checks.${system}`, "--apply", "builtins.attrNames", "--json"],
				ctx,
				signal,
			);
			return text((JSON.parse(names) as string[]).join("\n") || "No checks defined.");
		}
		const attr = `.#checks.${system}.${JSON.stringify(p.check)}`;
		const drv = await nixOk(["eval", "--raw", `${attr}.drvPath`], ctx, signal);
		const result = await nix(["build", attr, "--no-link", "--print-out-paths", "--print-build-logs"], ctx, signal);
		if (result.code === 0) return text(`${p.check} passed.\ndrv: ${drv}\nout: ${result.stdout.trim()}`);

		// The failing derivation may be a dependency of the check.
		const failed = result.stderr.match(/[Bb]uilder for '([^']+\.drv)' failed/)?.[1] ?? drv;
		const log = await limit(result.stderr.trimEnd(), "tail", "nix-flake-check");
		return { ...text(`${p.check} failed.\nfailing drv: ${failed}\n\n${log}`), isError: true };
	},
});
