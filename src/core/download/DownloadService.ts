import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { DownloadableChapter } from "../../types";
import download from "image-downloader";
import path from "path";
import fs from "fs/promises";
import TYPES from "../../config/inversify/inversify.types";
import ProgressManager from "../io/progress/ProgressManager";
import { limit } from "../../utils/performance";
import LogFile from "../io/LogFile";

@boundClass
@injectable()
class DownloadService {
  constructor(
    @inject(TYPES.ProgressManager) private progress: ProgressManager,
    @inject(TYPES.LogFile) private logFile: LogFile
  ) {}

  async start(comicTitle: string, chapters: DownloadableChapter[]) {
    this.progress.createComicBar(comicTitle, chapters.length);

    for (const chapter of chapters) {
      await this.downloadChapter(chapters, comicTitle, chapter);
      this.progress.advanceComic();
    }

    this.progress.completeComic();
  }

  private async downloadChapter(
    chapters: DownloadableChapter[],
    comicTitle: string,
    chapter: DownloadableChapter
  ) {
    await this.createChapterFolder(comicTitle, chapter.title);

    this.progress.createChapterBar(chapter.title, chapter.imageLinks.length);

    await limit(
      chapter.imageLinks.map((url, index) => async () => {
        try {
          return download.image({
            url,
            dest: path.join(
              this.getChapterPath(comicTitle, chapter.title),
              `${this.getImageIndex(chapters, chapter, index + 1)}.png`
            ),
            timeout: 0,
          });
        } catch {
          this.logFile.registerFailedDownload({
            chapter,
            image: { url, index },
          });
        } finally {
          this.progress.advanceChapter();
        }
      })
    );

    this.progress.completeChapter();
  }

  private getChapterPath(comicTitle: string, chapterTitle: string): string {
    return path.join(
      __dirname,
      "..",
      "..",
      "..",
      "comics",
      this.sanitize(comicTitle),
      this.sanitize(chapterTitle)
    );
  }

  private getImageIndex(
    chapters: DownloadableChapter[],
    currentChapter: DownloadableChapter,
    imageIndex: number
  ): number {
    const previousChapters = chapters.slice(
      0,
      chapters.indexOf(currentChapter)
    );

    return previousChapters.reduce((prev, current) => {
      return prev + current.imageLinks.length;
    }, imageIndex);
  }

  private async createChapterFolder(comicTitle: string, chapterTitle: string) {
    await fs.mkdir(this.getChapterPath(comicTitle, chapterTitle), {
      recursive: true,
    });
  }

  private sanitize(input: string): string {
    return input.replaceAll(" ", "-").toLowerCase();
  }
}

export default DownloadService;
