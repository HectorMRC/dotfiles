import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { nixOk } from "./run-nix.ts";

export default defineTool({
	name: "nix-flake-info",
	label: "nix flake info",
	description:
		"Show each top-level input's store path for the flake in the current directory (fetching inputs into the store as needed).",
	annotations: READ_ONLY,
	parameters: Type.Object({}),
	async execute(_id, _p, signal, _u, ctx) {
		const archive = JSON.parse(
			await nixOk(["flake", "archive", "--json", "--no-write-lock-file"], ctx, signal),
		) as {
			path: string;
			inputs: Record<string, { path: string }>;
		};
		const inputs = Object.entries(archive.inputs).map(([name, input]) => `${name}: ${input.path}`);
		return text([`self: ${archive.path}`, ...inputs].join("\n"));
	},
});
