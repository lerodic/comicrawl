import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { FailedDownloads, Mode, PreparedChapter } from "../../types";
import TYPES from "../../config/inversify/inversify.types";
import LogFile from "../io/LogFile";
import DownloadService from "../download/DownloadService";
import LogFileCorrupted from "../error/errors/LogFileCorrupted";

@boundClass
@injectable()
class FailedDownloadsMode implements Mode {
  constructor(
    @inject(TYPES.LogFile) private logFile: LogFile,
    @inject(TYPES.DownloadService) private download: DownloadService
  ) {}

  async run() {
    const logFileContent = await this.logFile.read();
    if (!this.logFile.isValid(logFileContent)) {
      throw new LogFileCorrupted();
    }

    await this.download.start(
      logFileContent.comic.title,
      this.convertToDownloadableFormat(logFileContent.failedDownloads)
    );
  }

  private convertToDownloadableFormat(
    failedDownloads: FailedDownloads
  ): PreparedChapter[] {
    return Object.entries(failedDownloads).map(([title, images]) => ({
      title,
      url: "",
      images,
    }));
  }
}

export default FailedDownloadsMode;
