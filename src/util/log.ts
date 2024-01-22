const level = {
	info: "info",
	debug: "debug",
	error: "error",
	warn: "warn",
} as const;

type LogLevel = keyof typeof level;

const levelString: Record<LogLevel, string> = {
	info: "\x1b[34m",
	debug: "\x1b[36m",
	error: "\x1b[31m",
	warn: "\x1b[33m",
};

const modeVerbose = Boolean(Bun.env.VERBOSE === "true");
const modeDebug = Boolean(Bun.env.DEBUG === "true");
const modeQuiet = Boolean(Bun.env.QUIET === "true");

function shouldLog(level: LogLevel): boolean {
	if (level === "error") return true;
	if (modeQuiet) return false;
	if (modeVerbose) return true;
	if (modeDebug && level === "debug") return true;
	return false;
}

export function logger(level: LogLevel, module: string, message: string) {
	const permission = shouldLog(level);
	if (!permission) return;
	const entry = `[${levelString[level]}${module}\x1b[0m] ${message}`;
	console.log(entry);
}

modeVerbose && logger("info", "LOG", "Verbose log mode enabled.");
modeDebug && logger("debug", "LOG", "Debug mode enabled.");
