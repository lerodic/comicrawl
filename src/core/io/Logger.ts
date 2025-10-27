import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import chalk from "chalk";
import { SourceOfTermination } from "../../types";

@boundClass
@injectable()
class Logger {
  info(message: string) {
    console.log(chalk.whiteBright.bold(message));
  }

  error(message: string) {
    console.log(chalk.redBright.bold(message));
  }

  warn(message: string) {
    console.log(chalk.yellowBright.bold(message));
  }

  success(message: string) {
    console.log(chalk.greenBright.bold(message));
  }

  logChaptersFound(title: string, chapterCounter: number) {
    this.info(
      `Found ${chalk.blueBright.bold(
        chapterCounter
      )} chapters for '${chalk.blueBright.bold(title)}'.\n`
    );
  }

  logSessionOutcome(
    sourceOfTermination: SourceOfTermination,
    numFailedDownloads: number
  ) {
    const method = this.getSessionOutcomeMethod(
      sourceOfTermination,
      numFailedDownloads
    );
    const message = this.getSessionOutcomeMessage(
      sourceOfTermination,
      numFailedDownloads
    );

    method(`\n${message}`);
  }

  private getSessionOutcomeMethod(
    sourceOfTermination: SourceOfTermination,
    numFailedDownloads: number
  ) {
    switch (sourceOfTermination) {
      case "Error":
        return this.error;
      case "Program":
        return numFailedDownloads === 0 ? this.success : this.warn;
      case "User":
        return this.info;
    }
  }

  private getSessionOutcomeMessage(
    sourceOfTermination: SourceOfTermination,
    numFailedDownloads: number
  ): string {
    switch (sourceOfTermination) {
      case "User":
        return "Application exited by user.";
      case "Error":
        return "The application encountered an error. Check the log file for more info.";
      case "Program":
        return numFailedDownloads === 0
          ? "Download completed. No errors have been tracked."
          : `${chalk.whiteBright.bold(numFailedDownloads)} ${
              numFailedDownloads === 1 ? "download" : "downloads"
            } failed. Check the log file for more info.`;
    }
  }
}

export default Logger;
