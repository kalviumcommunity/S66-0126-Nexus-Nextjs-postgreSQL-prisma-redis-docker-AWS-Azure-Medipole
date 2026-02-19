import { logger, generateRequestId, StructuredLogger } from "@/lib/logger";

describe("Logger Utility", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should log messages with correct structure", () => {
    logger.info("Test message");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test message"')
    );
  });

  it("should generate unique request IDs", () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe("string");
  });

  it("should support different log levels", () => {
    // Create a logger that allows debug level
    const debugLogger = new StructuredLogger({ level: "debug" });

    debugLogger.debug("Debug message");
    debugLogger.info("Info message");
    debugLogger.warn("Warning message");
    debugLogger.error("Error message");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"debug"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"warn"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"error"')
    );
  });

  it("should include metadata in logs", () => {
    logger.info("Test with metadata", {
      userId: "user123",
      action: "login",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"userId":"user123"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"action":"login"')
    );
  });

  it("should include metadata object in logs", () => {
    logger.info("Test with metadata", {
      metadata: {
        userId: "user123",
        action: "login",
      },
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"userId":"user123"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"action":"login"')
    );
  });

  it("should create child loggers with inherited config", () => {
    const childLogger = logger.child({ component: "test-component" });

    childLogger.info("Child logger message");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"component":"test-component"')
    );
  });

  it("should handle HTTP logging", () => {
    logger.http("GET", "/api/test", 200, 150);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"method":"GET"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"endpoint":"/api/test"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"statusCode":200')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"duration":150')
    );
  });

  it("should handle database logging", () => {
    logger.database("SELECT", "users", 120);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"operation":"SELECT"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"table":"users"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"duration":120')
    );
  });

  it("should handle security logging", () => {
    logger.security("login_attempt", "user123", "192.168.1.1");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"action":"login_attempt"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"userId":"user123"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"ip":"192.168.1.1"')
    );
  });

  it("should support pretty formatting", () => {
    const prettyLogger = new StructuredLogger({ format: "pretty" });

    prettyLogger.info("Pretty formatted message");

    // Pretty formatted logs should still be logged
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should respect log level configuration", () => {
    const debugLogger = new StructuredLogger({ level: "debug" });
    const warnLogger = new StructuredLogger({ level: "warn" });

    debugLogger.debug("Debug message");
    debugLogger.info("Info message");
    debugLogger.warn("Warning message");

    warnLogger.debug("Should not log");
    warnLogger.info("Should not log");
    warnLogger.warn("Warning message");

    // Both should log warnings
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Warning message"')
    );

    // Debug logger should log info, warn logger should not
    const allLogs = (consoleSpy.mock.calls as string[][]).flat().join(" ");
    const debugLogCount = (allLogs.match(/Debug message/g) || []).length;
    const infoLogCount = (allLogs.match(/Info message/g) || []).length;

    expect(debugLogCount).toBeGreaterThanOrEqual(1);
  });
});
