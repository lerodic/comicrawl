import { boundClass } from "autobind-decorator";
import { ProgressInfo } from "../../types";
import { Chalk } from "chalk";

@boundClass
class ProgressBarFormatter {
  constructor(
    private readonly width: number,
    private color: Chalk,
    private generateLabel: (title: string) => string
  ) {}

  format(progress: ProgressInfo): string {
    const percent = this.getBarProgressionInPercent(progress);

    const bar = this.getFormattedBar(percent);
    const percentage = this.getFormattedProgression(percent);
    const formattedLabel = this.getFormattedLabel(progress);
    const counter = this.getFormattedCounter(progress);

    return `${bar} ${percentage} | ${formattedLabel} ${counter}`;
  }

  private getBarProgressionInPercent(progress: ProgressInfo): number {
    return progress.itemsTotal === 0
      ? 0
      : progress.itemsCompleted / progress.itemsTotal;
  }

  private getFormattedBar(percent: number): string {
    const spotsFilled = Math.round(percent * this.width);

    return (
      this.color.bold("█".repeat(spotsFilled)) +
      this.color.dim("░".repeat(this.width - spotsFilled))
    );
  }

  private getFormattedProgression(percent: number): string {
    return this.color.bold(`${Math.round(percent * 100)}%`);
  }

  private getFormattedLabel(progress: ProgressInfo): string {
    const label = this.generateLabel(progress.title!);

    return label.length > 30 ? `${label.substring(0, 27)}...` : label;
  }

  private getFormattedCounter(progress: ProgressInfo): string {
    return this.color.dim(
      `(${progress.itemsCompleted}/${progress.itemsTotal})`
    );
  }
}

export default ProgressBarFormatter;
