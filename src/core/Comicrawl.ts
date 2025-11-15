import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import { SourceOfTermination } from "../types";
import ErrorHandler from "./error/ErrorHandler";
import LogFile from "./io/LogFile";
import ModeFactory from "./factories/ModeFactory";

@boundClass
@injectable()
class Comicrawl {
  private hasShutdownBeenInitiated = false;

  constructor(
    @inject(TYPES.ModeFactory) private modeFactory: ModeFactory,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.LogFile) private logFile: LogFile
  ) {}

  async run() {
    await this.init();

    try {
      const mode = await this.modeFactory.getMode();
      await mode.run();

      await this.shutdown("Program");
    } catch (err: any) {
      await this.handleError(err);
    }
  }

  private async init() {
    await this.logFile.init();

    process.on("SIGINT", async () => {
      await this.shutdown("User");
    });
  }

  private async handleError(err: any) {
    if (this.errorHandler.shouldErrorBeIgnored(err)) {
      return this.shutdown("User");
    }

    this.errorHandler.handle(err);
    await this.shutdown("Error");
  }

  private async shutdown(sourceOfTermination: SourceOfTermination = "Program") {
    if (this.hasShutdownBeenInitiated) return;
    this.hasShutdownBeenInitiated = true;

    await this.logFile.dump(sourceOfTermination);

    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  }
}

export default Comicrawl;
