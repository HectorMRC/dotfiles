import { dirname } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { fail, run } from "../lib/run-command.ts";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { manifestPath } from "./run-cargo.ts";

export default defineTool({
	name: "cargo-dependency-path",
	label: "cargo dependency path",
	description:
		"Locate a dependency crate's on-disk source directory (the one holding its Cargo.toml) so you can read its source, for every version in the dependency graph.",
	annotations: READ_ONLY,
	parameters: Type.Object({
		crate: Type.String({ description: "Crate name as in Cargo.toml" }),
		manifestPath,
	}),
	async execute(_id, p, signal, _u, ctx) {
		const args = ["metadata", "--format-version=1", ...(p.manifestPath ? ["--manifest-path", p.manifestPath] : [])];
		const result = await run("cargo", args, { cwd: ctx.cwd, signal });
		if (result.code !== 0) fail("cargo metadata", result);
		const { packages } = JSON.parse(result.stdout) as {
			packages: { name: string; version: string; manifest_path: string }[];
		};
		const normalized = p.crate.replace(/-/g, "_");
		const found = packages.filter((pkg) => pkg.name.replace(/-/g, "_") === normalized);
		if (found.length === 0) throw new Error(`${p.crate} is not in the dependency graph.`);
		return text(found.map((pkg) => `${pkg.name} ${pkg.version}: ${dirname(pkg.manifest_path)}`).join("\n"));
	},
});
