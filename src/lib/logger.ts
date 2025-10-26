/**
 * Lightweight logger with levels and scope, safe for server and browser.
 * - Uses LOG_LEVEL or NEXT_PUBLIC_LOG_LEVEL to control verbosity.
 * - Levels: debug < info < warn < error
 * - In dev: pretty message; In prod: compact JSON line for easier ingestion.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let overrideLevel: LogLevel | undefined;

function envLogLevel(): LogLevel {
  const v = (
    process.env.NEXT_PUBLIC_LOG_LEVEL ||
    process.env.LOG_LEVEL ||
    "info"
  ).toLowerCase();
  if (v === "debug" || v === "info" || v === "warn" || v === "error") return v;
  return "info";
}

function currentLevel(): LogLevel {
  return overrideLevel ?? envLogLevel();
}

export function setLogLevel(level: LogLevel) {
  overrideLevel = level;
}

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel()];
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

function safeSerialize(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value, objReplacer));
  } catch {
    return String(value);
  }
}

function objReplacer(_key: string, value: unknown) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
}

function baseLog(
  level: LogLevel,
  scope: string | undefined,
  message: string,
  meta?: Record<string, unknown>
) {
  if (!shouldLog(level)) return;

  const time = new Date().toISOString();
  const payload = meta ? safeSerialize(meta) : undefined;

  if (isProd()) {
    // JSON line for easier parsing in logs aggregators
    const line = JSON.stringify({ level, time, scope, message, meta: payload });
    // Map to appropriate console method
    const c: Console = console;
    (c[level] ?? c.log).call(c, line);
    return;
  }

  // Dev: human-friendly
  const prefix = [time, level.toUpperCase(), scope ? `[${scope}]` : undefined]
    .filter(Boolean)
    .join(" ");
  if (payload !== undefined) {
    // Use console methods for level
    const c: Console = console;
    (c[level] ?? c.log).call(c, `${prefix}: ${message}`, payload);
  } else {
    const c: Console = console;
    (c[level] ?? c.log).call(c, `${prefix}: ${message}`);
  }
}

export type Logger = {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

export function createLogger(scope?: string): Logger {
  return {
    debug: (message, meta) => baseLog("debug", scope, message, meta),
    info: (message, meta) => baseLog("info", scope, message, meta),
    warn: (message, meta) => baseLog("warn", scope, message, meta),
    error: (message, meta) => baseLog("error", scope, message, meta),
  };
}

// Default app logger (no scope)
export const logger = createLogger();

export default logger;
