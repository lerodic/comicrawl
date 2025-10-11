import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import inquirer from "inquirer";
import { isURL } from "validator";
import CONFIG from "../../config/app.config";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "./Logger";
import chalk from "chalk";

@boundClass
@injectable()
class Prompt {
  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  async getUrl(): Promise<string> {
    const { url } = await inquirer.prompt([
      {
        type: "input",
        name: "url",
        message: chalk.magentaBright.bold(
          "Where do you want to download a comic/manga from?"
        ),
      },
    ]);

    return this.isValidUrl(url) ? url : this.handleUrlRetrievalError();
  }

  private isValidUrl(url: string): boolean {
    return (
      isURL(url) &&
      CONFIG.SUPPORTED_DOMAINS.some((domain) => url.startsWith(domain))
    );
  }

  private handleUrlRetrievalError() {
    this.logger.error(
      "Please enter a valid URL. Below is a list of valid domains:\n"
    );

    CONFIG.SUPPORTED_DOMAINS.forEach((domain) => {
      this.logger.info(`- ${domain}\n`);
    });

    return this.getUrl();
  }
}

export default Prompt;
