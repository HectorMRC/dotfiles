import type { ToolAnnotations } from "@earendil-works/pi-coding-agent";

export const READ_ONLY: ToolAnnotations = { readOnlyHint: true };

export function text(value: string, details?: unknown) {
	return { content: [{ type: "text" as const, text: value }], details };
}
