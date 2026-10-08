import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { READ_ONLY } from "../lib/tool-result.ts";
import { jj } from "./run-jj.ts";

export default defineTool({
	name: "jj-status",
	label: "jj status",
	description:
		"Show jj (jujutsu) working copy status. Also snapshots the working copy, which auto-tracks new files into the colocated git tree so nix flake evaluation can see them.",
	annotations: READ_ONLY,
	parameters: Type.Object({}),
	execute: (_id, _p, signal, _u, ctx) => jj(["status"], ctx, signal),
});
