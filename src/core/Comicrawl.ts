import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import CrawlerFactory from "./factories/CrawlerFactory";
import { Chapter, DownloadableChapter, DownloadInfo } from "../types";
import Logger from "./io/Logger";
import pLimit from "p-limit";
import ProgressManager from "./io/progress/ProgressManager";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";
import fs from "fs/promises";
import path from "path";
import download from "image-downloader";
import { CONCURRENCY_LEVEL } from "../config/constants";
import ErrorHandler from "./error/ErrorHandler";
import PreparationService from "./download/PreparationService";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.ProgressManager) private progress: ProgressManager
    @inject(TYPES.PreparationService) private preparation: PreparationService,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
  ) {}

  async run() {
    try {
      const { title, chapters } = await this.preparation.start();

      await this.downloadChapters(title, chapters);
    } catch (err: any) {
      this.errorHandler.handle(err);
    } finally {
      await this.closeBrowser();
    }
  }
  private limit<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    const limit = pLimit(CONCURRENCY_LEVEL);

    return Promise.all(tasks.map((task) => limit(task)));
  }

  private async downloadChapters(
    comicTitle: string,
    chapters: DownloadableChapter[]
  ) {
    this.progress.createComicBar(comicTitle, chapters.length);

    for (const chapter of chapters) {
      await this.downloadChapter(comicTitle, chapter);
      this.progress.advanceComic();
    }

    this.progress.completeComic();
  }

  private async downloadChapter(
    comicTitle: string,
    chapter: DownloadableChapter
  ) {
    await this.createChapterFolder(comicTitle, chapter.title);

    this.progress.createChapterBar(chapter.title, chapter.imageLinks.length);

    await this.limit(
      chapter.imageLinks.map((imageLink, index) => async () => {
        this.progress.advanceChapter();

        return download.image({
          url: imageLink,
          dest: path.join(
            this.getChapterPath(comicTitle, chapter.title),
            `${index + 1}.png`
          ),
        });
      })
    );

    this.progress.completeChapter();
  }

  private getChapterPath(comicTitle: string, chapterTitle: string): string {
    return path.join(
      __dirname,
      "..",
      "..",
      "comics",
      this.sanitize(comicTitle),
      this.sanitize(chapterTitle)
    );
  }

  private async createChapterFolder(comicTitle: string, chapterTitle: string) {
    await fs.mkdir(this.getChapterPath(comicTitle, chapterTitle), {
      recursive: true,
    });
  }

  private sanitize(input: string): string {
    return input.replaceAll(" ", "-").toLowerCase();
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
