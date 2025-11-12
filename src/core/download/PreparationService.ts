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
import ConnectionInterrupted from "../error/errors/ConnectionInterrupted";
import { DownloadOption } from "../../config/constants";

@boundClass
@injectable()
class PreparationService {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.ProgressManager) private progress: ProgressManager
  ) {}

  async start(): Promise<DownloadInfo> {
    try {
      return await this.extractMangaInfo();
    } finally {
      await this.crawlerFactory.getCrawler().terminate();
    }
  }

  private async extractMangaInfo(): Promise<DownloadInfo> {
    const url = await this.prompt.getUrl();
    const title = await this.crawlerFactory.getCrawler(url).extractTitle(url);
    const selectedChapters = await this.getChaptersToDownload(url, title);
    const preparedChapters = await this.prepareChaptersForDownload(
      title,
      selectedChapters
    );

    return { url, title, chapters: preparedChapters };
  }

  private async getChaptersToDownload(
    url: string,
    title: string
  ): Promise<Chapter[]> {
    const chapters = await this.crawlerFactory
      .getCrawler(url)
      .extractChapters(url);

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
      case DownloadOption.All:
        return chapters;
      case DownloadOption.Partial:
        return this.getChaptersStartingAt(chapters);
      case DownloadOption.Selective:
        return this.getChaptersBySelection(chapters);
      case DownloadOption.Range:
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
    const crawler = this.crawlerFactory.getCrawler();

    try {
      return await this.prepareChapterImages(chapters, crawler);
    } catch {
      throw new ConnectionInterrupted();
    }
  }

  private async prepareChapterImages(chapters: Chapter[], crawler: Crawler) {
    const downloadableChapters = await limit(
      chapters.map((chapter) => async () => {
        return this.prepareChapter(crawler, chapter);
      })
    );

    this.progress.completePreparation();

    return downloadableChapters;
  }

  private async prepareChapter(crawler: Crawler, chapter: Chapter) {
    const imageLinks = await crawler.extractImageLinks(chapter.url);

    this.progress.advancePreparation();

    return { ...chapter, imageLinks };
  }
}

export default PreparationService;
