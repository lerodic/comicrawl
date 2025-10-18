import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import {
  Chapter,
  Crawler,
  DownloadableChapter,
  DownloadInfo,
} from "../../types";
import EmptyGraphicNovel from "../error/errors/EmptyGraphicNovel";
import { limit } from "../../utils/performance";
import TYPES from "../../config/inversify/inversify.types";
import Prompt from "../io/Prompt";
import CrawlerFactory from "../factories/CrawlerFactory";
import ProgressManager from "../io/progress/ProgressManager";

@boundClass
@injectable()
class PreparationService {
  private crawler: Crawler | undefined = undefined;

  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.ProgressManager) private progress: ProgressManager
  ) {}

  async start(): Promise<DownloadInfo> {
    const url = await this.prompt.getUrl();
    this.crawler = this.crawlerFactory.getCrawler(url);
    const title = await this.crawler.extractTitle(url);
    const selectedChapters = await this.getChaptersToDownload(url, title);
    const preparedChapters = await this.prepareChaptersForDownload(
      title,
      selectedChapters
    );

    await this.crawler.terminate();

    return { title, chapters: preparedChapters };
  }

  private async getChaptersToDownload(
    url: string,
    title: string
  ): Promise<Chapter[]> {
    const chapters = await this.crawler!.extractChapters(url);

    if (chapters.length === 0) {
      throw new EmptyGraphicNovel(title);
    }

    return this.getCorrectChapters(title, chapters);
  }

  private async getCorrectChapters(
    title: string,
    chapters: Chapter[]
  ): Promise<Chapter[]> {
    const downloadOption = await this.prompt.getDownloadOption(
      title,
      chapters.length
    );

    switch (downloadOption) {
      case "All":
        return chapters;
      case "Partial":
        return this.getChaptersStartingAt(chapters);
      case "Selective":
        return this.getChaptersBySelection(chapters);
      case "Range":
        return this.getChaptersInRange(chapters);
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

  private async getChaptersInRange(chapters: Chapter[]): Promise<Chapter[]> {
    const start = await this.prompt.getChaptersStartingAt(chapters);
    const end = await this.prompt.getChaptersEndpoint(start, chapters);

    return chapters.slice(start - 1, end);
  }

  private async prepareChaptersForDownload(
    title: string,
    chapters: Chapter[]
  ): Promise<DownloadableChapter[]> {
    this.progress.createPreparationBar(title, chapters.length);

    const downloadableChapters = await limit(
      chapters.map((chapter) => async () => {
        try {
          const imageLinks = await this.crawler!.extractImageLinks(chapter.url);

          return { ...chapter, imageLinks };
        } finally {
          this.progress.advancePreparation();
        }
      })
    );

    this.progress.completePreparation();

    return downloadableChapters;
  }
}

export default PreparationService;
