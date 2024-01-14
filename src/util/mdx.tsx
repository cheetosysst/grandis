export function parseTextToHtml(content: string) {
	const result = content
		.split("\n")
		.filter((paragraph) => paragraph !== "")
		.map((paragraph) => <p safe>{paragraph}</p>);
	return result;
}
