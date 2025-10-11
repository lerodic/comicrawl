import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import chalk from "chalk";

@boundClass
@injectable()
class Logger {
  info(message: string) {
    console.log(chalk.whiteBright.bold(message));
  }

  error(message: string) {
    console.log(chalk.redBright.bold(message));
  }

  logChapterRequest() {
    this.info("\nRequesting chapter list. This may take a moment.\n");
  }

  logChaptersFound(title: string, chapterCounter: number) {
    this.info(
      `Found ${chalk.blueBright.bold(
        chapterCounter
      )} chapters for ${chalk.blueBright.bold(title)}.\n`
    );
  }
}

export default Logger;
