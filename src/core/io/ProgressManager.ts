import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import { ProgressInfo } from "../../types";
import chalk from "chalk";

@boundClass
@injectable()
class ProgressManager {
  constructor(
    private chapterPreparationProgress: ProgressInfo = {
      title: undefined,
      itemsTotal: 0,
      itemsCompleted: 0,
    }
  ) {}

  createChapterPreparationBar(title: string, itemsTotal: number) {
    this.chapterPreparationProgress = {
      title,
      itemsTotal,
      itemsCompleted: 0,
    };

    console.log("\n");
    this.renderChapterPreparationBar();
  }

  advanceChapterPreparation() {
    this.chapterPreparationProgress.itemsCompleted++;

    this.renderChapterPreparationBar();
  }

  completeChapterPreparation() {
    this.chapterPreparationProgress.itemsCompleted =
      this.chapterPreparationProgress.itemsTotal;

    this.renderChapterPreparationBar();
  }

  private clearLastNLines(n: number) {
    for (let i = 0; i < n; i++) {
      // move cursor up one line
      process.stdout.write("\x1b[1A");
      // clear entire line
      process.stdout.write("\x1b[2K");
    }
  }

  private renderChapterPreparationBar() {
    this.clearLastNLines(1);

    console.log(
      `${this.renderBar(
        this.chapterPreparationProgress.itemsCompleted,
        this.chapterPreparationProgress.itemsTotal,
        `Preparing chapters`,
        chalk.greenBright
      )}`
    );
  }

  private renderBar(
    current: number,
    total: number,
    label: string,
    color: chalk.Chalk
  ): string {
    const percent = total === 0 ? 0 : current / total;
    const width = 30;
    const filled = Math.round(percent * width);

    const bar =
      color.bold("█".repeat(filled)) + color.dim("░".repeat(width - filled));
    const percentage = color.bold(`${Math.round(percent * 100)}%`);
    const counter = color.dim(`(${current}/${total})`);

    return `${bar} ${percentage} | ${label} ${counter}`;
  }
}

export default ProgressManager;
