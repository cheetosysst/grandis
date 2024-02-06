import path from "path";
import fs from "fs";
import { Glob } from "bun";
import { Route } from "./layout";

export default function build() {
	console.log("🔨 Running build mode");
	import("./layout");
}

const contentDirectory = path.join(process.cwd(), "content");
const outDirectory = path.join(process.cwd(), "out");

const getPostPaths = () => {
	const globResults = new Glob("*.mdx").scanSync(contentDirectory);
	return globResults;
};
const Page = () => Html.createElement("div", {});

const tree = new Route("", {})
	.page(Page)
	.route(
		new Route("post", {})
			.page(Page)
			.group(({ children }) => Html.createElement("div", {}, children), {
				source: Array.from(getPostPaths()),
			})
	)
	.route(new Route("about", {}).page(Page));

fs.rmSync(outDirectory, { recursive: true });
tree.build();
