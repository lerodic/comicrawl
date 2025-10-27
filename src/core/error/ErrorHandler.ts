import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "../io/Logger";
import EmptyGraphicNovel from "./errors/EmptyGraphicNovel";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";
import LogFileCreationFailed from "./errors/LogFileCreationFailed";

@boundClass
@injectable()
class ErrorHandler {
  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  handle(err: any) {
    const message = this.isApplicationError(err)
      ? err.message
      : "Something unexpected happened.";

    this.logger.error(`\n${message}`);
  }

  private isApplicationError(err: any): boolean {
    const applicationErrors = [
      EmptyGraphicNovel,
      CrawlerInitializationFailed,
      LogFileCreationFailed,
    ];

    return applicationErrors.some(
      (applicationError) => err instanceof applicationError
    );
  }
}

export default ErrorHandler;
