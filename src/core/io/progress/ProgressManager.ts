import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import ProgressBar from "./ProgressBar";
import TYPES from "../../../config/inversify/inversify.types";

@boundClass
@injectable()
class ProgressManager {
  constructor(
    @inject(TYPES.PreparationProgressBar)
    private preparationProgressBar: ProgressBar,
    @inject(TYPES.ComicProgressBar) private comicProgressBar: ProgressBar,
    @inject(TYPES.ChapterProgressBar) private chapterProgressBar: ProgressBar
  ) {}

  createPreparationBar(title: string, itemsTotal: number) {
    this.preparationProgressBar.init(title, itemsTotal, 2);
  }

  advancePreparation() {
    this.preparationProgressBar.advance();
  }

  completePreparation() {
    this.preparationProgressBar.complete();
  }

  createComicBar(title: string, itemsTotal: number) {
    this.comicProgressBar.init(title, itemsTotal, 1);
  }

  advanceComic() {
    this.comicProgressBar.advance();
  }

  completeComic() {
    this.comicProgressBar.complete();
  }

  createChapterBar(title: string, itemsTotal: number) {
    this.chapterProgressBar.init(title, itemsTotal);
  }

  advanceChapter() {
    this.chapterProgressBar.advance();
  }

  completeChapter() {
    this.chapterProgressBar.complete();
  }
}

export default ProgressManager;
