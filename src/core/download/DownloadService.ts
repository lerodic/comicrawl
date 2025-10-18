import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { DownloadableChapter } from "../../types";
import download from "image-downloader";
import path from "path";
import fs from "fs/promises";
import TYPES from "../../config/inversify/inversify.types";
import ProgressManager from "../io/progress/ProgressManager";
import { limit } from "../../utils/performance";

@boundClass
@injectable()
class DownloadService {
  constructor(
    @inject(TYPES.ProgressManager) private progress: ProgressManager
  ) {}

  async start(comicTitle: string, chapters: DownloadableChapter[]) {
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

    await limit(
      chapter.imageLinks.map((imageLink, index) => async () => {
        try {
          return download.image({
            url: imageLink,
            dest: path.join(
              this.getChapterPath(comicTitle, chapter.title),
              `${index + 1}.png`
            ),
            timeout: 0,
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
}

export default DownloadService;
