import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export interface BufferDetails {
	buffer: string;
	lines: string[];
}

const BUFFER_TOOLS = new Set(["copy-lines", "cut-lines"]);

export const bufferRangeParams = {
	path: Type.String(),
	start: Type.Integer({ minimum: 1, description: "First line, 1-indexed" }),
	end: Type.Integer({ minimum: 1, description: "Last line, inclusive" }),
	buffer: Type.String({ description: "Buffer name to store the lines under" }),
};

export function findBuffer(ctx: ExtensionToolContext, name: string): string[] | undefined {
	const branch = ctx.sessionManager.getBranch();
	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i];
		if (entry.type !== "message") continue;
		const message = entry.message as {
			role: string;
			toolName?: string;
			isError?: boolean;
			details?: BufferDetails;
		};
		if (message.role !== "toolResult" || !BUFFER_TOOLS.has(message.toolName ?? "") || message.isError) continue;
		if (message.details?.buffer === name) return message.details.lines;
	}
	return undefined;
}
