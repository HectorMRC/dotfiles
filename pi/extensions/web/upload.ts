import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolvePath } from "../lib/tool-params.ts";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";

export default defineTool({
	name: "upload",
	label: "upload",
	description:
		"Upload a local file (`path`) or inline string (`body`) to an http(s) URL with POST or PUT, as the raw body or (`form: true`) as multipart/form-data.",
	annotations: { openWorldHint: true },
	parameters: Type.Object({
		url: Type.String(),
		path: Type.Optional(Type.String({ description: "Local file to upload" })),
		body: Type.Optional(Type.String({ description: "Inline content to upload" })),
		method: Type.Optional(Type.Union([Type.Literal("POST"), Type.Literal("PUT")], { description: "Default POST" })),
		form: Type.Optional(Type.Boolean({ description: "Send as multipart/form-data" })),
		field: Type.Optional(Type.String({ description: "Form field name (default file)" })),
		filename: Type.Optional(Type.String({ description: "File name sent in the form (default: basename of path)" })),
		contentType: Type.Optional(Type.String({ description: "Content-Type of the data" })),
		headers: Type.Optional(Type.Record(Type.String(), Type.String())),
	}),
	async execute(_id, p, signal, _u, ctx) {
		if (!/^https?:\/\//i.test(p.url)) throw new Error("Only http(s) URLs are supported.");
		if ((p.path === undefined) === (p.body === undefined)) throw new Error("Set exactly one of `path` or `body`.");
		const data = p.path !== undefined ? await readFile(resolvePath(ctx.cwd, p.path)) : Buffer.from(p.body!, "utf8");
		const type = p.contentType ?? (p.path !== undefined ? "application/octet-stream" : "text/plain; charset=utf-8");
		const blob = new Blob([data], { type });
		const headers = new Headers(p.headers);

		let body: Blob | FormData = blob;
		if (p.form) {
			body = new FormData();
			body.append(p.field ?? "file", blob, p.filename ?? (p.path ? basename(p.path) : "upload.txt"));
		} else if (!headers.has("content-type")) {
			headers.set("content-type", type);
		}

		const response = await fetch(p.url, { method: p.method ?? "POST", body, headers, signal }).catch(
			(err: Error) => {
				throw new Error(
					`Uploading to ${p.url} failed: ${(err.cause as Error | undefined)?.message ?? err.message}`,
				);
			},
		);
		const reply = await limit(await response.text(), "head", "upload");
		const summary = `HTTP ${response.status} ${response.statusText} (${data.length} bytes sent)`;
		return { ...text(reply ? `${summary}\n\n${reply}` : summary), isError: !response.ok };
	},
});
