/**
 * test
 */
async function dev() {
	console.log("hello");

	const content = await import("./test.mdx");
	console.log(content);
}

export default dev;
