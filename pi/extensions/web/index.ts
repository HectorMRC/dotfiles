import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import upload from "./upload.ts";
import webFetch from "./web-fetch.ts";

const promptGuidelines = ["Fetch web pages with `web-fetch` and send data to URLs with `upload`."];

export default function (pi: ExtensionAPI) {
	for (const tool of [webFetch, upload]) pi.registerTool({ ...tool, promptGuidelines });
}
