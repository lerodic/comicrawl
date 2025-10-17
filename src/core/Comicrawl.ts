import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import CrawlerFactory from "./factories/CrawlerFactory";
import Logger from "./io/Logger";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";
import ErrorHandler from "./error/ErrorHandler";
import DownloadService from "./download/DownloadService";
import PreparationService from "./download/PreparationService";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.ProgressManager) private progress: ProgressManager
    @inject(TYPES.PreparationService) private preparation: PreparationService,
    @inject(TYPES.DownloadService) private download: DownloadService,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
  ) {}

  async run() {
    try {
      const { title, chapters } = await this.preparation.start();

      await this.download.start(title, chapters);
    } catch (err: any) {
      this.errorHandler.handle(err);
    } finally {
      await this.closeBrowser();
    }
  }
  private handleError(err: any) {
    const message = this.isApplicationError(err)
      ? err.message
      : "Something unexpected happened.";

    this.logger.error(`\n${message}`);
  }

  private isApplicationError(err: any): boolean {
    return (
      err instanceof EmptyGraphicNovel ||
      err instanceof CrawlerInitializationFailed
    );
  }

  async closeBrowser() {
    await this.crawlerFactory.getCrawler().terminate();
  }
}

export default Comicrawl;
