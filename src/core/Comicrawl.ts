import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import DownloadService from "./download/DownloadService";
import PreparationService from "./download/PreparationService";
import { EventEmitter } from "../types";
import ErrorHandler from "./error/ErrorHandler";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.PreparationService) private preparation: PreparationService,
    @inject(TYPES.DownloadService) private download: DownloadService,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.EventEmitter) private emitter: EventEmitter
  ) {}

  async run() {
    try {
      const { title, chapters } = await this.preparation.start();

      await this.download.start(title, chapters);
    } catch (err: any) {
      this.errorHandler.handle(err);
    } finally {
      this.emitter.emit("applicationTerminated");
    }
  }
}

export default Comicrawl;
