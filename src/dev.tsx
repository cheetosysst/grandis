import "@kitajs/html/register";

async function dev() {
	// console.log("hello");

	const Content = (await import("./test.mdx")).default;
	const temp = <Content />;
	console.log("================================\n");
	console.log(temp);
}

export default dev;
