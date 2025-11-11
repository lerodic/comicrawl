import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "../io/Logger";
import EmptyGraphicNovel from "./errors/EmptyGraphicNovel";
import CrawlerInitializationFailed from "./errors/CrawlerInitializationFailed";
import LogFileCreationFailed from "./errors/LogFileCreationFailed";
import ConnectionInterrupted from "./errors/ConnectionInterrupted";

@boundClass
@injectable()
class ErrorHandler {
  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  handle(err: any) {
    const message = this.getCorrectErrorMessage(err);

    this.logger.error(`\n${message}`);
  }

  private getCorrectErrorMessage(err: any): string {
    if (this.isNetworkError(err)) {
      return "Network connection lost.";
    } else if (this.isApplicationError(err)) {
      return err.message;
    } else {
      return "Something unexpected happened.";
    }
  }

  private isNetworkError(err: any): boolean {
    const networkRelatedMessages = [
      "getaddrinfo ENOTFOUND",
      "net::ERR_INTERNET_DISCONNECTED",
    ];

    return (
      err instanceof ConnectionInterrupted ||
      networkRelatedMessages.some((message) => err.message.includes(message))
    );
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
