import type { PropsWithChildren } from "@kitajs/html";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<>
			{"<!DOCTYPE html>"}
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<title>Document</title>
				</head>
				<body>{children}</body>
			</html>
		</>
	);
}
