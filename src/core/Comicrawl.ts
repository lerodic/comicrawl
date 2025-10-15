import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import Prompt from "./io/Prompt";
import CrawlerFactory from "./factories/CrawlerFactory";
import { Chapter, DownloadableChapter, DownloadInfo } from "../types";
import EmptyGraphicNovel from "./errors/EmptyGraphicNovel";
import Logger from "./io/Logger";
import pLimit from "p-limit";
import ProgressManager from "./io/progress/ProgressManager";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";
import fs from "fs/promises";
import path from "path";
import download from "image-downloader";
import { CONCURRENCY_LEVEL } from "../config/constants";

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

      await this.downloadChapters(title, chapters);
    } catch (err: any) {
      this.handleError(err);
    } finally {
      await this.closeBrowser();
    }
  }

  private async prepareDownload(): Promise<DownloadInfo> {
    const url = await this.prompt.getUrl();

    const title = await this.crawlerFactory.getCrawler(url).extractTitle(url);
    const selectedChapters = await this.getChaptersToDownload(url, title);
    const preparedChapters = await this.prepareChaptersForDownload(
      title,
      selectedChapters
    );

    return { title, chapters: preparedChapters };
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
    const limit = pLimit(CONCURRENCY_LEVEL);
    const crawler = this.crawlerFactory.getCrawler();

    this.progress.createPreparationBar(title, chapters.length);

    const downloadableChapters = await Promise.all(
      chapters.map((chapter) =>
        limit(async () => {
          try {
            const imageLinks = await crawler.extractImageLinks(chapter.url);

            return { ...chapter, imageLinks };
          } finally {
            this.progress.advancePreparation();
          }
        })
      )
    );

    this.progress.completePreparation();
    await this.closeBrowser();

    return downloadableChapters;
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
    const limit = pLimit(CONCURRENCY_LEVEL);
    await this.createChapterFolder(comicTitle, chapter.title);

    this.progress.createChapterBar(chapter.title, chapter.imageLinks.length);

    await Promise.all(
      chapter.imageLinks.map((imageLink, index) =>
        limit(async () => {
          this.progress.advanceChapter();

          return download.image({
            url: imageLink,
            dest: path.join(
              __dirname,
              "..",
              "..",
              "comics",
              this.sanitize(comicTitle),
              this.sanitize(chapter.title),
              `${index + 1}.png`
            ),
          });
        })
      )
    );

    this.progress.completeChapter();
  }

  private async createChapterFolder(comicTitle: string, chapterTitle: string) {
    await fs.mkdir(
      path.join(
        __dirname,
        "..",
        "..",
        "comics",
        this.sanitize(comicTitle),
        this.sanitize(chapterTitle)
      ),
      { recursive: true }
    );
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

  private async closeBrowser() {
    await this.crawlerFactory.getCrawler().terminate();
  }
}

export default Comicrawl;
