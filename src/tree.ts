import path from "path";
import { generateTree } from "./util/structure";

export default function tree() {
	console.log("🌲 Running tree mode");
	const root = path.join(process.cwd(), "content");
	const tree = generateTree(root);
	console.log(tree);
}
