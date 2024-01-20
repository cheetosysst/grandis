import "@kitajs/html/register";
import path from "path";
import fs from "fs";

async function dev() {
	console.log("🛠️  Running dev mode");

	const ComponentText = (
		await import(path.join(process.cwd(), "content", "foo/bar.txt"))
	).default;
	const ComponentMdx = (
		await import(path.join(process.cwd(), "content", "./test.mdx"))
	).default;
	const ComponentMd = (
		await import(path.join(process.cwd(), "content", "tests/content.md"))
	).default;

	console.log({
		ComponentText: <ComponentText />,
		ComponentMdx: <ComponentMdx />,
		ComponentMd: <ComponentMd />,
	});

	console.log("============== Text ==============");
	console.log(<ComponentText />);
	console.log("============== MDX  ===============");
	console.log(<ComponentMdx />);
	console.log("=============== MD ===============");
	console.log(<ComponentMd />);

	fs.mkdir(path.join(process.cwd(), "out"), (e) => {});

	const fileText = Bun.file(
		path.join(process.cwd(), "out", "text.html")
	).writer();
	fileText.write(ComponentText({}).toString());
	fileText.end();
	const fileMdx = Bun.file(
		path.join(process.cwd(), "out", "mdx.html")
	).writer();
	fileMdx.write(ComponentMdx({}).toString());
	fileMdx.end();
	const fileMd = Bun.file(
		path.join(process.cwd(), "out", "md.html")
	).writer();
	fileMd.write(ComponentMd({}).toString());
	fileMd.end();
}

export default dev;
