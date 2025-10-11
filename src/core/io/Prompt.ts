import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import inquirer from "inquirer";
import { isURL } from "validator";
import CONFIG from "../../config/app.config";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "./Logger";
import chalk from "chalk";
import { Chapter, DownloadOption } from "../../types";
import { DOWNLOAD_OPTIONS } from "../../config/constants";

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

  async getDownloadOption(): Promise<DownloadOption> {
    const { downloadOption } = await inquirer.prompt([
      {
        type: "list",
        name: "downloadOption",
        message: chalk.magentaBright.bold("I would like to download..."),
        choices: DOWNLOAD_OPTIONS,
      },
    ]);

    return downloadOption;
  }

  async getChaptersStartingAt(chapters: Chapter[]): Promise<number> {
    const { startingPoint } = await inquirer.prompt([
      {
        type: "number",
        name: "startingPoint",
        message: "Which chapter would you like to start at?",
      },
    ]);

    return this.isValidStartingPoint(startingPoint, chapters.length)
      ? startingPoint
      : this.handleStartingPointRetrievalError(chapters);
  }

  private isValidStartingPoint(input: number, max: number): boolean {
    return input >= 1 && input <= max;
  }

  private async handleStartingPointRetrievalError(
    chapters: Chapter[]
  ): Promise<number> {
    this.logger.error(
      `Invalid chapter selection. Value must be >= 1 and <= ${chapters.length}.`
    );

    return this.getChaptersStartingAt(chapters);
  }

  async getChaptersFromList(chapters: Chapter[]): Promise<string[]> {
    const { selectedChapters } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedChapters",
        message: "Select all chapters you wish to download:",
        choices: chapters.map((chapter) => chapter.title),
      },
    ]);

    return selectedChapters;
  }
}

export default Prompt;
