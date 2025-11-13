import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import LogFile from "../io/LogFile";
import PreparationService from "../download/PreparationService";
import DownloadService from "../download/DownloadService";
import { Mode } from "../../types";

@boundClass
@injectable()
class DefaultMode implements Mode {
  constructor(
    @inject(TYPES.LogFile) private logFile: LogFile,
    @inject(TYPES.PreparationService) private preparation: PreparationService,
    @inject(TYPES.DownloadService) private download: DownloadService
  ) {}

  async run() {
    const { url, title, chapters } = await this.preparation.start();

    this.logFile.registerSessionInfo({ url, title });

    await this.download.start(title, chapters);
  }
}

export default DefaultMode;
