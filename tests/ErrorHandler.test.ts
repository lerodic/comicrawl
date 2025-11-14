import ErrorHandler from "../src/core/error/ErrorHandler";
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
