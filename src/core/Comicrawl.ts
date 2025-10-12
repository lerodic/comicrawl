import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import Prompt from "./io/Prompt";
import CrawlerFactory from "./factories/CrawlerFactory";
import { Chapter, DownloadableChapter, DownloadInfo } from "../types";
import EmptyGraphicNovel from "./errors/EmptyGraphicNovel";
import Logger from "./io/Logger";
import pLimit from "p-limit";
import ProgressManager from "./io/ProgressManager";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.ProgressManager) private progress: ProgressManager
  ) {}

  async run() {
    try {
      const { title, chapters } = await this.prepareDownload();

      this.logger.logDownloadStarted(title, chapters.length);
    } catch (err: any) {
      this.handleError(err);
    }

    await this.shutdown();
  }

  private async prepareDownload(): Promise<DownloadInfo> {
    const url = await this.prompt.getUrl();

    this.logger.logChapterRequest();

    const title = await this.crawlerFactory.getCrawler(url).extractTitle(url);
    const chapters = await this.prepareChaptersForDownload(
      title,
      await this.getChaptersToDownload(url, title)
    );

    return { title, chapters };
  }

  private async getChaptersToDownload(
    url: string,
    title: string
  ): Promise<Chapter[]> {
    const chapters = await this.crawlerFactory
      .getCrawler()
      .extractChapters(url);

    if (this.isEmptyGraphicNovel(chapters)) {
      throw new EmptyGraphicNovel(title);
    }

    this.logger.logChaptersFound(title, chapters.length);

    return this.getCorrectChapters(chapters);
  }

  private isEmptyGraphicNovel(chapters: Chapter[]): boolean {
    return chapters.length === 0;
  }

  private async getCorrectChapters(chapters: Chapter[]): Promise<Chapter[]> {
    const downloadOption = await this.prompt.getDownloadOption();

    switch (downloadOption) {
      case "All":
        return chapters;
      case "Partial":
        return this.getChaptersStartingAt(chapters);
      case "Selective":
        return this.getChaptersBySelection(chapters);
    }
  }

  private async getChaptersStartingAt(chapters: Chapter[]): Promise<Chapter[]> {
    const startingPoint = await this.prompt.getChaptersStartingAt(chapters);

    return chapters.slice(startingPoint - 1);
  }

  private async getChaptersBySelection(
    chapters: Chapter[]
  ): Promise<Chapter[]> {
    const selectedChapters = await this.prompt.getChaptersFromList(chapters);

    return chapters.filter((chapter) =>
      selectedChapters.includes(chapter.title)
    );
  }

  private async prepareChaptersForDownload(
    title: string,
    chapters: Chapter[]
  ): Promise<DownloadableChapter[]> {
    const limit = pLimit(10);

    this.progress.createChapterPreparationBar(title, chapters.length);

    const downloadableChapters = await Promise.all(
      chapters.map((chapter) =>
        limit(async () => {
          const imageLinks = await this.crawlerFactory
            .getCrawler()
            .extractImageLinks(chapter.url);
          this.progress.advanceChapterPreparation();

          return { ...chapter, imageLinks };
        })
      )
    );

    this.progress.completeChapterPreparation();

    return downloadableChapters;
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

  private async shutdown() {
    await this.crawlerFactory.getCrawler().terminate();
  }
}

export default Comicrawl;
