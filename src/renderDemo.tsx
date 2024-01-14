import "@kitajs/html/register";
// import { renderToString } from "@kitajs/html/suspense";
import path from "path";
import fs from "fs";

async function dev() {
	console.log("🛠️  Running dev mode");

	const ComponentText = (
		await import(path.join(process.cwd(), "content", "./test.txt"))
	).default;
	const ComponentMdx = (
		await import(path.join(process.cwd(), "content", "./test.mdx"))
	).default;
	const ComponentMd = (
		await import(path.join(process.cwd(), "content", "./test.md"))
	).default;

	const contentText = (ComponentText as unknown as Array<string>).join("\n");
	const contentMdx = ComponentMdx({}).toString();
	const contentMd = ComponentMd({}).toString();

	console.log("============== Text ==============");
	console.log(typeof contentText);
	console.log("============== MDX  ===============");
	console.log(<ComponentMdx />);
	console.log("=============== MD ===============");
	console.log(<ComponentMd />);

	fs.mkdir(path.join(process.cwd(), "out"), (e) => {});

	const fileText = Bun.file(
		path.join(process.cwd(), "out", "text.html")
	).writer();
	fileText.write(contentText);
	fileText.end();
	const fileMdx = Bun.file(
		path.join(process.cwd(), "out", "mdx.html")
	).writer();
	fileMdx.write(contentMdx);
	fileMdx.end();
	const fileMd = Bun.file(
		path.join(process.cwd(), "out", "md.html")
	).writer();
	fileMd.write(contentMd);
	fileMd.end();
}

export default dev;
