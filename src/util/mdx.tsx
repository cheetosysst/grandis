import { Html, type PropsWithChildren } from "@kitajs/html";
import { evaluate } from "@mdx-js/mdx";
import type { MDXProps } from "mdx/types";

export function parseTextToHtml(content: string, props: MDXProps) {
	const result = content
		.split("\n")
		.filter((paragraph) => paragraph !== "")
		.map((paragraph) => <p safe>{paragraph}</p>);
	return <>{result}</>;
}

export function parseMarkdownToHtml(content: string) {
	return evaluate(content, {
		Fragment: Html.Fragment,
		jsx: jsxHandler,
		jsxs: jsxHandler,
	});
}

function jsxHandler(
	type: unknown,
	props: PropsWithChildren,
	// added for compatibility but ignored at runtime
	key: string | undefined
) {
	// biome-ignore lint/complexity/noBannedTypes: `type` is unknown
	return Html.createElement(type as string | Function, props, props.children);
}
