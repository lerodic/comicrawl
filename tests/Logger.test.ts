import Logger from "../src/core/io/Logger";
import chalk from "chalk";
import { SourceOfTermination } from "../src/types";
import { logSessionOutcomeFixtures } from "./fixtures/Logger.fixtures";

describe("Logger", () => {
  let logger: Logger = new Logger();

  beforeEach(() => {
    chalk.level = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logSessionOutcome", () => {
    it.each(logSessionOutcomeFixtures)(
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
