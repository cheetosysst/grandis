import {
	generateTree,
	type ContentFile,
	type TreeNode,
} from "./util/structure";
import path from "path";
import fs from "fs";

export default function build() {
	console.log("🔨 Running build mode");
	const contentRoot = path.join(process.cwd(), "content");
	const tree = generateTree(contentRoot);

	buildNode(tree);
}

const contentDirectory = path.join(process.cwd(), "content");

function generatePage(treeNode: ContentFile) {
	const parsedPath = path.parse(treeNode.path);
	const relativePath = path.relative(contentDirectory, parsedPath.dir);
	const targetDirectory = path.join("out", relativePath);
	const filename = `${parsedPath.name}.html`;

	// TODO log function with env toggle
	console.log(
		`[\x1b[34mPAGE\x1b[0m] Generating page \x1b[32m"${path.join(
			relativePath,
			parsedPath.base
		)}"\x1b[0m`
	);

	import(treeNode.path).then((mod) => {
		const Component = mod.default;

		const content = Component({}).toString() as string;

		fs.mkdirSync(targetDirectory, { recursive: true });
		const file = Bun.file(path.join(targetDirectory, filename));
		const writer = file.writer();
		writer.write(content);
		writer.end();
	});
}

function buildNode(treeNode: TreeNode) {
	fs.rmSync(path.join(process.cwd(), "out", "*"), { recursive: true });
	if (!(treeNode instanceof Map)) return generatePage(treeNode);
	for (const [key, item] of treeNode) {
		buildNode(item as TreeNode);
	}
}
