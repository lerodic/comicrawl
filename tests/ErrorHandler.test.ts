import ErrorHandler from "../src/core/error/ErrorHandler";
import ConnectionInterrupted from "../src/core/error/errors/ConnectionInterrupted";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";
import Logger from "../src/core/io/Logger";
import {
  applicationErrors,
  networkErrors,
} from "./fixtures/ErrorHandler.fixtures";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    errorHandler = new ErrorHandler(mockLogger);
  });

  describe("shouldErrorBeIgnored", () => {
    it.each([
      {
        expected: true,
        err: { name: "ExitPromptError" },
        type: "ExitPromptError",
      },
      {
        expected: true,
        err: new CrawlerInitializationFailed(),
        type: "CrawlerInitializationFailed",
      },
      {
        expected: false,
        err: new Error(),
        type: "Error",
      },
      {
        expected: false,
        err: new ConnectionInterrupted(),
        type: "ConnectionInterrupted",
      },
    ])(
      "should return $expected for error of type: $type",
      ({ expected, err }) => {
        const result = errorHandler.shouldErrorBeIgnored(err);

        expect(result).toBe(expected);
      }
    );
  });

  describe("handle", () => {
    it.each(applicationErrors)(
      "should log custom error message for error of type: $type",
      ({ err, message }) => {
        errorHandler.handle(err);

        expect(mockLogger.error).toHaveBeenCalledWith(`\n${message}`);
      }
    );

    it.each(networkErrors)(
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
