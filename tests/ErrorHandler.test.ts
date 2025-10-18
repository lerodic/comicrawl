import ErrorHandler from "../src/core/error/ErrorHandler";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
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
        message: "\n'Title 1' is empty. Aborting.",
      },
    ])(
      "should log custom error message for error of type: $type",
      ({ err, message }) => {
        errorHandler.handle(err);

        expect(mockLogger.error).toHaveBeenCalledWith(message);
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
