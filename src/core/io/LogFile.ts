import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import {
  FailedDownloads,
  DownloadFailed,
  LogFileContent,
  LogFileUpdate,
  SessionStarted,
  SourceOfTermination,
  DefiniteLogFileContent,
} from "../../types";
import path from "path";
import fs from "fs/promises";
import Logger from "./Logger";
import LogFileCreationFailed from "../error/errors/LogFileCreationFailed";
import LogFileMissing from "../error/errors/LogFileMissing";
import LogFileCorrupted from "../error/errors/LogFileCorrupted";

@boundClass
@injectable()
class LogFile {
  private DEFAULT_CONTENT: LogFileContent = {
    createdAt: new Date(Date.now()),
    failedDownloads: {},
    sourceOfTermination: "Program",
  };

  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    private _failedDownloads: DownloadFailed[] = []
  ) {}

  get failedDownloads(): DownloadFailed[] {
    return [...this._failedDownloads];
  }

  async init() {
    if (!(await this.shouldCreateLogFile())) {
      return;
    }

    await this.create();
  }

  private async shouldCreateLogFile(): Promise<boolean> {
    try {
      await fs.readFile(this.getFilePath());

      return false;
    } catch {
      return true;
    }
  }

  private async create() {
    try {
      await this.createLogsFolder();

      await this.write(this.DEFAULT_CONTENT);
    } catch {
      throw new LogFileCreationFailed();
    }
  }

  private async createLogsFolder() {
    await fs.mkdir(this.getFolderPath(), { recursive: true });
  }

  private getFolderPath(): string {
    return path.join(__dirname, "..", "..", "..", "logs");
  }

  private async write(content: LogFileContent) {
    await fs.writeFile(this.getFilePath(), JSON.stringify(content), {
      encoding: "utf-8",
    });
  }

  private getFilePath(): string {
    return path.join(this.getFolderPath(), "log.json");
  }

  registerFailedDownload(event: DownloadFailed) {
    this._failedDownloads.push(event);
  }

  async registerSessionInfo(event: SessionStarted) {
    await this.update({
      comic: {
        title: event.title,
        url: event.url,
      },
    });
  }

  private async update(logFileUpdate: LogFileUpdate) {
    try {
      const content = await this.read();

      await this.write({
        ...content,
        ...logFileUpdate,
      });
    } catch {
      throw new LogFileMissing();
    }
  }

  async dump(sourceOfTermination: SourceOfTermination) {
    this.logger.logSessionOutcome(
      sourceOfTermination,
      this.failedDownloads.length
    );

    await this.update({
      failedDownloads: this.groupFailedDownloads(),
      sourceOfTermination,
    });
  }

  async read(): Promise<LogFileContent> {
    try {
      const stringified = await fs.readFile(this.getFilePath(), {
        encoding: "utf-8",
      });

      return JSON.parse(stringified);
    } catch {
      throw new LogFileCorrupted();
    }
  }

  private groupFailedDownloads(): FailedDownloads {
    return this.failedDownloads.reduce((grouped, failedDownload) => {
      return {
        ...grouped,
        [failedDownload.chapter.title]: [
          ...(grouped[failedDownload.chapter.title] ?? []),
          { index: failedDownload.image.index, url: failedDownload.image.url },
        ],
      };
    }, {} as any);
  }

  isValid(
    content: any | DefiniteLogFileContent
  ): content is DefiniteLogFileContent {
    return (
      content.comic !== undefined &&
      typeof content.comic.title === "string" &&
      typeof content.comic.url === "string" &&
      typeof content.createdAt === "string" &&
      typeof content.failedDownloads === "object" &&
      typeof content.sourceOfTermination === "string"
    );
  }
}

export default LogFile;
