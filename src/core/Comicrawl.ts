import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import Prompt from "./io/Prompt";
import CrawlerFactory from "./factories/CrawlerFactory";
import Chromium from "./crawl/Chromium";
import { Chapter } from "../types";
import EmptyGraphicNovel from "./errors/EmptyGraphicNovel";
import Logger from "./io/Logger";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.Chromium) private chromium: Chromium,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async run() {
    try {
      const { title, chapters } = await this.prepareDownload();
      console.log(title);
      console.log(chapters);
    } catch (err: any) {
      if (err instanceof EmptyGraphicNovel) {
        this.logger.error(err.message);
      }
    }

    await this.shutdown();
  }

  private async prepareDownload() {
    const url = await this.prompt.getUrl();

    this.logger.logChapterRequest();

    const title = await this.crawlerFactory.getCrawler(url).extractTitle(url);
    const chapters = await this.getChaptersToDownload(url, title);

    return { title, chapters };
  }

  private async getChaptersToDownload(
    url: string,
    title: string
  ): Promise<Chapter[]> {
    const chapters = await this.crawlerFactory
      .getCrawler(url)
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

  private async shutdown() {
    await this.chromium.terminate();
  }
}

export default Comicrawl;
