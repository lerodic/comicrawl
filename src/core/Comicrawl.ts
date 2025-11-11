import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import DownloadService from "./download/DownloadService";
import PreparationService from "./download/PreparationService";
import { SourceOfTermination } from "../types";
import ErrorHandler from "./error/ErrorHandler";
import LogFile from "./io/LogFile";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.PreparationService) private preparation: PreparationService,
    @inject(TYPES.DownloadService) private download: DownloadService,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.LogFile) private logFile: LogFile
  ) {}

  async run() {
    try {
      await this.init();

      const { url, title, chapters } = await this.preparation.start();

      this.logFile.registerSessionInfo({ url, title });

      await this.download.start(title, chapters);

      await this.shutdown("Program");
    } catch (err: any) {
      await this.handleError(err);
    }
  }

  private async init() {
    await this.logFile.create();

    process.on("SIGINT", async () => {
      await this.shutdown("User");
    });
  }

  private async handleError(err: any) {
    if (this.isExitPromptError(err)) {
      return this.shutdown("User");
    }

    this.errorHandler.handle(err);
    await this.shutdown("Error");
  }

  private isExitPromptError(err: any): boolean {
    return err.name === "ExitPromptError";
  }

  private async shutdown(sourceOfTermination: SourceOfTermination = "Program") {
    await this.logFile.dump(sourceOfTermination);
  }
}

export default Comicrawl;
