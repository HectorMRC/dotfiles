import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { gh } from "./run-gh.ts";

const QUERY = `
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number title url state isDraft createdAt body
      author { login }
      baseRefName headRefName
      timelineItems(last: 200, itemTypes: [PULL_REQUEST_REVIEW, ISSUE_COMMENT, PULL_REQUEST_COMMIT, HEAD_REF_FORCE_PUSHED_EVENT]) {
        nodes {
          __typename
          ... on PullRequestReview { author { login } state body submittedAt }
          ... on IssueComment { author { login } body createdAt }
          ... on PullRequestCommit { commit { abbreviatedOid messageHeadline committedDate } }
          ... on HeadRefForcePushedEvent { actor { login } createdAt beforeCommit { abbreviatedOid } afterCommit { abbreviatedOid } }
        }
      }
      reviewThreads(last: 100) {
        nodes {
          isResolved isOutdated path line originalLine
          comments(first: 50) {
            nodes { author { login } body createdAt diffHunk }
          }
        }
      }
    }
  }
}`;

// biome-ignore lint/suspicious/noExplicitAny: raw GraphQL response
export async function fetchPrActivity(
	ctx: ExtensionToolContext,
	pr?: string,
	repo?: string,
	signal?: AbortSignal,
): Promise<any> {
	const view = ["pr", "view", ...(pr ? [pr] : []), ...(repo ? ["--repo", repo] : []), "--json", "url"];
	const { url } = JSON.parse(await gh(view, ctx, signal)) as { url: string };
	const [, owner, name, number] = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/) ?? [];
	if (!number) throw new Error(`Unexpected PR URL: ${url}`);

	const args = ["api", "graphql", "-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `repo=${name}`];
	const raw = await gh([...args, "-F", `number=${number}`], ctx, signal);
	return JSON.parse(raw).data.repository.pullRequest;
}
