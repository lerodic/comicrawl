import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import inquirer from "inquirer";
import { isURL } from "validator";
import CONFIG from "../../config/app.config";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "./Logger";
import chalk from "chalk";
import { Chapter } from "../../types";
import { DOWNLOAD_OPTIONS, DownloadOption } from "../../config/constants";

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
      "\nPlease enter a valid URL. Below is a list of valid domains:\n"
    );

    CONFIG.SUPPORTED_DOMAINS.forEach((domain) => {
      this.logger.info(`- ${domain}\n`);
    });

    return this.getUrl();
  }

  async getDownloadOption(
    title: string,
    itemsTotal: number
  ): Promise<DownloadOption> {
    this.logger.logChaptersFound(title, itemsTotal);

    const { downloadOption } = await inquirer.prompt([
      {
        type: "list",
        name: "downloadOption",
        message: chalk.magentaBright.bold("I would like to download"),
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
        message: chalk.magentaBright.bold(
          "Which chapter would you like to start at?"
        ),
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
      `\nInvalid chapter selection. Value must be >= 1 and <= ${chapters.length}.\n`
    );

    return this.getChaptersStartingAt(chapters);
  }

  async getChaptersFromList(chapters: Chapter[]): Promise<string[]> {
    const { selectedChapters } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedChapters",
        message: chalk.magentaBright.bold(
          "Select all chapters you wish to download:"
        ),
        choices: chapters.map((chapter) => chapter.title),
      },
    ]);

    return selectedChapters;
  }

  async getChaptersEndpoint(
    startingPoint: number,
    chapters: Chapter[]
  ): Promise<number> {
    const { endPoint } = await inquirer.prompt([
      {
        type: "number",
        name: "endPoint",
        message: chalk.magentaBright.bold(
          "Which chapter would you like to stop at?"
        ),
      },
    ]);

    return this.isValidEndPoint(endPoint, startingPoint, chapters.length)
      ? endPoint
      : this.handleEndPointRetrievalError(startingPoint, chapters);
  }

  private isValidEndPoint(input: number, min: number, max: number): boolean {
    return input >= min && input <= max;
  }

  private async handleEndPointRetrievalError(
    min: number,
    chapters: Chapter[]
  ): Promise<number> {
    this.logger.error(
      `\nInvalid chapter selection. Value must be >= ${min} and <= ${chapters.length}.\n`
    );

    return this.getChaptersEndpoint(min, chapters);
  }

  async shouldRetryFailedDownloads(
    numFailedDownloads: number,
    comicTitle: string
  ): Promise<boolean> {
    this.logger.info(
      `${chalk.blueBright.bold(
        numFailedDownloads
      )} images failed to download for '${chalk.blueBright.bold(
        comicTitle
      )}'.\n`
    );

    const { userChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "userChoice",
        message: chalk.magentaBright.bold(
          "Would you like to try to download them again?"
        ),
        choices: [
          {
            name: "Yes",
            value: true,
          },
          {
            name: "No",
            value: false,
          },
        ],
      },
    ]);

    return userChoice;
  }
}

export default Prompt;
