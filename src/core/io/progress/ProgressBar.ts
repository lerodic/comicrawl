import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import { ProgressInfo } from "../../../types";
import { Chalk } from "chalk";
import ProgressBarFormatter from "./ProgressBarFormatter";

@boundClass
@injectable()
class ProgressBar {
  private readonly width: number = 30;
  private formatter: ProgressBarFormatter;

  constructor(
    color: Chalk,
    private lineDelta: number,
    generateLabel: (title: string) => string,
    private progress: ProgressInfo = {
      title: undefined,
      itemsCompleted: 0,
      itemsTotal: 0,
    }
  ) {
    this.formatter = new ProgressBarFormatter(this.width, color, generateLabel);
  }

  init(title: string, itemsTotal: number, numEmptyLines: number = 0) {
    this.progress = {
      title,
      itemsTotal,
      itemsCompleted: 0,
    };

    if (numEmptyLines !== 0) {
      this.renderEmptyLines(numEmptyLines);
    }

    this.render();
  }

  private renderEmptyLines(numEmptyLines: number) {
    const output = "".padStart(numEmptyLines, "\n");

    process.stdout.write(output);
  }

  advance() {
    this.progress.itemsCompleted++;

    this.render();
  }

  complete() {
    this.progress.itemsCompleted = this.progress.itemsTotal;

    this.render();
  }

  private render() {
    this.moveCursorUpTimes(this.lineDelta);
    this.clearLine();
    this.renderBar();
    this.moveCursorDownTimes(this.lineDelta);
  }

  private clearLine() {
    process.stdout.write("\x1b[2K\r");
  }

  private moveCursorUpTimes(n: number) {
    if (n === 0) return;

    process.stdout.write(`\x1b[${n}A`);
  }

  private moveCursorDownTimes(n: number) {
    if (n === 0) return;

    process.stdout.write(`\x1b[${n}B`);
  }

  private renderBar() {
    process.stdout.write(this.formatter.format(this.progress) + "\x1b[0K\r");
  }
}

export default ProgressBar;
