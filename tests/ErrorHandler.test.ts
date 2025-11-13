import ErrorHandler from "../src/core/error/ErrorHandler";
import ConnectionInterrupted from "../src/core/error/errors/ConnectionInterrupted";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
import LogFileCreationFailed from "../src/core/error/errors/LogFileCreationFailed";
import Logger from "../src/core/io/Logger";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    errorHandler = new ErrorHandler(mockLogger);
  });

  describe("handle", () => {
    it.each([
      {
        type: "EmptyGraphicNovel",
        err: new EmptyGraphicNovel("Title 1"),
        message: "'Title 1' is empty. Aborting.",
      },
      {
        type: "LogFileCreationFailed",
        err: new LogFileCreationFailed(),
        message:
          "Failed to create log file. Run Comicrawl again with elevated privileges.",
      },
    ])(
      "should log custom error message for error of type: $type",
      ({ err, message }) => {
        errorHandler.handle(err);

        expect(mockLogger.error).toHaveBeenCalledWith(`\n${message}`);
      }
    );

    it.each([
      {
        err: new Error("getaddrinfo ENOTFOUND"),
      },
      {
        err: new Error("getaddrinfo ENOTFOUND https://example.com"),
      },
      {
        err: new Error("net::ERR_INTERNET_DISCONNECTED"),
      },
      {
        err: new ConnectionInterrupted(),
      },
    ])(
      "should handle network-related error with message: '$err.message'",
      async ({ err }) => {
        errorHandler.handle(err);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `\nNetwork connection lost.`
        );
      }
    );

    it("should log predefined message for unexpected errors", () => {
      errorHandler.handle(new Error("Unexpected"));

      expect(mockLogger.error).toHaveBeenCalledWith(
        "\nSomething unexpected happened."
      );
    });
  });
});
