type Login = { login: string } | null;

interface Event {
	at: string;
	text: string;
}

const who = (user: Login) => `@${user?.login ?? "ghost"}`;

const indent = (s: string, prefix = "    ") =>
	s
		.trim()
		.split("\n")
		.map((l) => prefix + l)
		.join("\n");

// biome-ignore lint/suspicious/noExplicitAny: raw GraphQL response
function timelineEvents(pr: any): Event[] {
	const events: Event[] = [];
	for (const n of pr.timelineItems.nodes) {
		switch (n.__typename) {
			case "PullRequestReview":
				if (!n.submittedAt || (n.state === "COMMENTED" && !n.body)) break;
				events.push({
					at: n.submittedAt,
					text: `review ${n.state} by ${who(n.author)}${n.body ? `\n${indent(n.body)}` : ""}`,
				});
				break;
			case "IssueComment":
				events.push({ at: n.createdAt, text: `comment by ${who(n.author)}\n${indent(n.body)}` });
				break;
			case "PullRequestCommit":
				events.push({
					at: n.commit.committedDate,
					text: `push ${n.commit.abbreviatedOid} ${n.commit.messageHeadline}`,
				});
				break;
			case "HeadRefForcePushedEvent":
				events.push({
					at: n.createdAt,
					text: `force-push by ${who(n.actor)}: ${n.beforeCommit?.abbreviatedOid ?? "?"} -> ${n.afterCommit?.abbreviatedOid ?? "?"}`,
				});
				break;
		}
	}
	return events;
}

// biome-ignore lint/suspicious/noExplicitAny: raw GraphQL response
function reviewThreadEvents(pr: any): Event[] {
	const events: Event[] = [];
	for (const t of pr.reviewThreads.nodes) {
		const [first, ...replies] = t.comments.nodes;
		if (!first) continue;
		const status = [t.isResolved ? "resolved" : "unresolved", t.isOutdated ? "outdated" : ""]
			.filter(Boolean)
			.join(", ");
		const hunk = (first.diffHunk as string).split("\n").slice(-6).join("\n");
		const lines = [
			`inline thread on ${t.path}:${t.line ?? t.originalLine ?? "?"} (${status})`,
			indent(hunk, "    | "),
			`    ${who(first.author)}:`,
			indent(first.body, "      "),
			...replies.map((r: { author: Login; body: string; createdAt: string }) =>
				[`    reply by ${who(r.author)} at ${r.createdAt}:`, indent(r.body, "      ")].join("\n"),
			),
		];
		events.push({ at: first.createdAt, text: lines.join("\n") });
	}
	return events;
}

// biome-ignore lint/suspicious/noExplicitAny: raw GraphQL response
export function formatPrTimeline(pr: any): string {
	const events = [...timelineEvents(pr), ...reviewThreadEvents(pr)].sort((a, b) => a.at.localeCompare(b.at));
	const header = [
		`#${pr.number} ${pr.title}`,
		`${pr.url}`,
		`${pr.state}${pr.isDraft ? " (draft)" : ""} by ${who(pr.author)}, ${pr.headRefName} -> ${pr.baseRefName}, opened ${pr.createdAt}`,
		pr.body ? `\n${pr.body.trim()}` : "",
	].join("\n");
	const timeline = events.map((e) => `[${e.at}] ${e.text}`).join("\n\n");
	return `${header}\n\n## Timeline\n\n${timeline || "(no activity)"}`;
}
