import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import copyLines from "./copy-lines.ts";
import cutLines from "./cut-lines.ts";
import pasteLines from "./paste-lines.ts";

export default function (pi: ExtensionAPI) {
	for (const tool of [copyLines, cutLines, pasteLines]) pi.registerTool(tool);
}
