import Logger from "../src/core/io/Logger";
import chalk from "chalk";
import { SourceOfTermination } from "../src/types";

describe("Logger", () => {
  let logger: Logger = new Logger();

  beforeEach(() => {
    chalk.level = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logSessionOutcome", () => {
    it.each([
      {
        sourceOfTermination: "User",
        numFailedDownloads: 0,
        message: "Application exited by user.",
        method: chalk.whiteBright.bold,
        level: "INFO",
      },
      {
        sourceOfTermination: "Error",
        numFailedDownloads: 0,
        message:
          "The application encountered an error. Check the log file for more info.",
        method: chalk.redBright.bold,
        level: "ERROR",
      },
      {
        sourceOfTermination: "Program",
        numFailedDownloads: 0,
        message: "Download completed. No errors have been tracked.",
        method: chalk.greenBright.bold,
        level: "SUCCESS",
      },
      {
        sourceOfTermination: "Program",
        numFailedDownloads: 1,
        message: "1 download failed. Check the log file for more info.",
        method: chalk.yellowBright.bold,
        level: "WARN",
      },
      {
        sourceOfTermination: "Program",
        numFailedDownloads: 2,
        message: "2 downloads failed. Check the log file for more info.",
        method: chalk.yellowBright.bold,
        level: "WARN",
      },
    ])(
      "Should log ($level) '$message' for '$sourceOfTermination' and $numFailedDownloads failed download(s)",
      async ({ sourceOfTermination, numFailedDownloads, message, method }) => {
        const logSpy = jest.spyOn(console, "log");

        logger.logSessionOutcome(
          sourceOfTermination as SourceOfTermination,
          numFailedDownloads
        );

        expect(logSpy).toHaveBeenCalledWith(method(`\n${message}`));
      }
    );
  });
});
