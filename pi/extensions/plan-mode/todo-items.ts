export interface TodoItem {
	step: number;
	text: string;
	title: string;
	description?: string;
	completed: boolean;
}

// Matches "**Title**: description", "Title: description" and "Title - description".
const TITLE_PATTERNS = [/^\*\*([^*]+)\*\*[:.]?\s+(.+)$/, /^([^:]{1,80}?):\s+(.+)$/, /^(.{1,80}?)\s+[-–—]\s+(.+)$/];

function splitTitle(text: string): { title: string; description?: string } {
	for (const pattern of TITLE_PATTERNS) {
		const match = text.match(pattern);
		if (match?.[1] && match[2]) {
			return { title: cleanStepText(match[1]), description: cleanStepText(match[2]) };
		}
	}
	return { title: cleanStepText(text) };
}

function cleanStepText(text: string): string {
	let cleaned = text
		.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // bold/italic
		.replace(/`([^`]+)`/g, "$1") // inline code
		.replace(/\s+/g, " ")
		.trim();

	if (cleaned.length > 0) {
		cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	}
	return cleaned;
}

export function extractTodoItems(message: string): TodoItem[] {
	const items: TodoItem[] = [];
	const headerMatch = message.match(/\*{0,2}Plan:\*{0,2}\s*\n/i);
	if (!headerMatch) return items;

	const planSection = message.slice(message.indexOf(headerMatch[0]) + headerMatch[0].length);
	// Unindented only: indented numbers are sub-steps of the previous step.
	const numberedPattern = /^(\d+)[.)]\s+(.+)/;

	// Only the first numbered list after the header counts. Any unindented,
	// non-blank, non-numbered line ends it.
	let listStarted = false;
	for (const line of planSection.split("\n")) {
		const match = line.match(numberedPattern);
		if (!match) {
			if (listStarted && line.trim() !== "" && !/^\s/.test(line)) break;
			continue;
		}
		listStarted = true;
		const text = match[2].trim();
		const start = text.replace(/^\*+/, "");
		if (start.length > 5 && !start.startsWith("`") && !start.startsWith("/") && !start.startsWith("-")) {
			const cleaned = cleanStepText(text);
			if (cleaned.length > 3) {
				items.push({ step: items.length + 1, text: cleaned, ...splitTitle(text), completed: false });
			}
		}
	}
	return items;
}

export function markCompletedSteps(text: string, items: TodoItem[]): void {
	for (const match of text.matchAll(/\[DONE:(\d+)\]/gi)) {
		const item = items.find((t) => t.step === Number(match[1]));
		if (item) item.completed = true;
	}
}
