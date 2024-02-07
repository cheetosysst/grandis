import { Route } from "../../src/layout";

const route = new Route("", {}).page(() => {
	return (
		<div>
			<h1>This is a title</h1>
			<p>this is a paragraph</p>
		</div>
	);
});

export default route;
