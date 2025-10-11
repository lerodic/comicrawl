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
}

export default Logger;
