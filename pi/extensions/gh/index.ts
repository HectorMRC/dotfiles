import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import prComments from "./pr-comments.ts";

export default function (pi: ExtensionAPI) {
	pi.registerTool(prComments);
}
