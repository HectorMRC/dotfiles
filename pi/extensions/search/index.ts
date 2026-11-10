import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import fd from "./fd.ts";
import rg from "./rg.ts";

const promptGuidelines = ["Find files with `fd` and search contents with `rg`."];

export default function (pi: ExtensionAPI) {
	for (const tool of [rg, fd]) pi.registerTool({ ...tool, promptGuidelines });
}
