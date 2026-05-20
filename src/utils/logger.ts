type LogLevel = "debug" | "info" | "warn" | "error";

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const parseLevel = (rawLevel: string | undefined): LogLevel => {
  const normalized = rawLevel?.toLowerCase();

  if (
    normalized === "debug" ||
    normalized === "info" ||
    normalized === "warn" ||
    normalized === "error"
  ) {
    return normalized;
  }

  return "info";
};

const minLevel = parseLevel(process.env.LOG_LEVEL);

const log = (
  level: LogLevel,
  message: string,
  details: Record<string, unknown>,
) => {
  if (levelWeights[level] < levelWeights[minLevel]) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...details,
  };

  const raw = JSON.stringify(payload);

  if (level === "error") {
    console.error(raw);
    return;
  }

  console.log(raw);
};

export const logger = {
  debug: (message: string, details: Record<string, unknown> = {}) => {
    log("debug", message, details);
  },
  info: (message: string, details: Record<string, unknown> = {}) => {
    log("info", message, details);
  },
  warn: (message: string, details: Record<string, unknown> = {}) => {
    log("warn", message, details);
  },
  error: (message: string, details: Record<string, unknown> = {}) => {
    log("error", message, details);
  },
};
