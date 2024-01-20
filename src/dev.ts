import path from "path";
import { generateTree } from "./util/structure";

export default function dev() {
	console.log("🔧 Running dev mode");
	const contentRoot = path.join(process.cwd(), "content");
	const tree = generateTree(contentRoot);

	console.log(tree);
}
