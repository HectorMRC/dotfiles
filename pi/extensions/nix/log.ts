import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { combined, fail } from "../lib/run-command.ts";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";
import { nix } from "./run-nix.ts";

export default defineTool({
	name: "nix-log",
	label: "nix log",
	description:
		"Show the build log for a derivation or store path, e.g. the drvPath reported by a failed nix-flake-check.",
	annotations: READ_ONLY,
	parameters: Type.Object({ path: Type.String({ description: "/nix/store path of a .drv or build output" }) }),
	async execute(_id, p, signal, _u, ctx) {
		const result = await nix(["log", p.path], ctx, signal);
		if (result.code !== 0) fail("nix log", result);
		return text(await limit(combined(result) || "(empty log)", "tail", "nix-log"));
	},
});
