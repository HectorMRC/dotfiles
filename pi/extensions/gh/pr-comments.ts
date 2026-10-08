import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { text } from "../lib/tool-result.ts";
import { limit } from "../lib/truncate-output.ts";
import { fetchPrActivity } from "./fetch-pr-activity.ts";
import { formatPrTimeline } from "./format-pr-timeline.ts";

export default defineTool({
	name: "gh-pr-comments",
	label: "gh PR comments",
	description:
		"Show a GitHub PR's review activity: metadata plus one timestamped timeline of submitted reviews, conversation comments, branch pushes/force-pushes and inline review threads (with diff context and replies), so it is clear what was addressed by later pushes.",
	annotations: { readOnlyHint: true, openWorldHint: true },
	parameters: Type.Object({
		pr: Type.Optional(Type.String({ description: "PR number, URL or branch (default: the current branch's PR)" })),
		repo: Type.Optional(Type.String({ description: "OWNER/REPO when not the current repository" })),
	}),
	async execute(_id, p, signal, _u, ctx) {
		const pr = await fetchPrActivity(ctx, p.pr, p.repo, signal);
		return text(await limit(formatPrTimeline(pr), "head", "gh-pr-comments"));
	},
});
