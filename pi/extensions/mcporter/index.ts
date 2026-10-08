import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { combined, fail, run } from "../lib/run-command.ts";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

const mcporter = defineTool({
	name: "mcporter",
	label: "mcporter",
	description: "Run mcporter to list MCP servers and their tools, or call a tool (`call server.tool key=value`).",
	parameters: Type.Object({
		args: Type.Array(Type.String(), { description: "Arguments after `mcporter`, one per item", minItems: 1 }),
	}),
	async execute(_id, p, signal, _u, ctx) {
		const result = await run("mcporter", p.args, { cwd: ctx.cwd, signal });
		if (result.code !== 0) fail(`mcporter ${p.args[0]}`, result);
		return text(await limit(combined(result) || "(no output)", "head", "mcporter"));
	},
});

export default function (pi: ExtensionAPI) {
	pi.registerTool(mcporter);
}
