import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import copyLines from "./copy-lines.ts";
import cutLines from "./cut-lines.ts";
import pasteLines from "./paste-lines.ts";

const promptGuidelines = ["Move code blocks with `cut-lines`/`copy-lines` and `paste-lines`."];

export default function (pi: ExtensionAPI) {
	for (const tool of [copyLines, cutLines, pasteLines]) pi.registerTool({ ...tool, promptGuidelines });
}
