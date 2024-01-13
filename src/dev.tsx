import "@kitajs/html/register";
// import { renderToString } from "@kitajs/html/suspense";
import path from "path";

async function dev() {
	console.log("🛠️  Running dev mode");

	const ComponentText = (await import("./test.txt")).default;
	const ComponentMdx = (await import("./test.mdx")).default;
	const ComponentMd = (await import("./test.md")).default;

	const contentText = (ComponentText as unknown as Array<string>).join("\n");
	const contentMdx = ComponentMdx({}).toString();
	const contentMd = ComponentMd({}).toString();

	console.log("============== Text ==============");
	console.log(typeof contentText);
	console.log("============== MDX  ===============");
	console.log(<ComponentMdx />);
	console.log("=============== MD ===============");
	console.log(<ComponentMd />);

	const fileText = Bun.file(
		path.join(process.cwd(), "content", "text.html")
	).writer();
	fileText.write(contentText);
	fileText.end();
	const fileMdx = Bun.file(
		path.join(process.cwd(), "content", "mdx.html")
	).writer();
	fileMdx.write(contentMdx);
	fileMdx.end();
	const fileMd = Bun.file(
		path.join(process.cwd(), "content", "md.html")
	).writer();
	fileMd.write(contentMd);
	fileMd.end();
}

export default dev;
