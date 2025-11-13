import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import {
  FailedDownloads,
  LogFileContent,
  Mode,
  ModeFactoryFn,
} from "../../types";
import LogFile from "../io/LogFile";
import Prompt from "../io/Prompt";
import LogFileCorrupted from "../error/errors/LogFileCorrupted";

@boundClass
@injectable()
class ModeFactory {
  constructor(
    @inject(TYPES.ModeFactoryFn) private modeFactoryFn: ModeFactoryFn,
    @inject(TYPES.LogFile) private logFile: LogFile,
    @inject(TYPES.Prompt) private prompt: Prompt
  ) {}

  async getMode(): Promise<Mode> {
    const logFileContent = await this.logFile.read();
    if (!this.logFile.isValid(logFileContent)) {
      throw new LogFileCorrupted();
    }

    if (!this.containsFailedDownloads(logFileContent)) {
      return this.modeFactoryFn(false);
    }

    const shouldRetryFailedDownloads =
      await this.prompt.shouldRetryFailedDownloads(
        this.getNumFailedDownloads(logFileContent.failedDownloads),
        logFileContent.comic.title
      );

    return this.modeFactoryFn(shouldRetryFailedDownloads);
  }

  private containsFailedDownloads(logFileContent: LogFileContent): boolean {
    return this.getNumFailedDownloads(logFileContent.failedDownloads) !== 0;
  }

  private getNumFailedDownloads(failedDownloads: FailedDownloads): number {
    return Object.values(failedDownloads).reduce(
      (total, images) => total + images.length,
      0
    );
  }
}

export default ModeFactory;
