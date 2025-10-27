import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import {
  DownloadFailed,
  FailedDownloads,
  LogFileContent,
  LogFileUpdate,
  SessionStarted,
  SourceOfTermination,
} from "../../types";
import path from "path";
import fs from "fs/promises";
import Logger from "./Logger";
import LogFileCreationFailed from "../error/errors/LogFileCreationFailed";
import LogFileMissing from "../error/errors/LogFileMissing";

@boundClass
@injectable()
class LogFile {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    private _failedDownloads: DownloadFailed[] = []
  ) {}

  get failedDownloads(): DownloadFailed[] {
    return [...this._failedDownloads];
  }

  async create() {
    try {
      await this.createLogsFolder();

      const content: LogFileContent = {
        comic: {
          title: undefined,
          url: undefined,
        },
        createdAt: new Date(Date.now()),
        failedDownloads: {},
        sourceOfTermination: "Program",
      };

      await this.write(content);
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

  private async read(): Promise<LogFileContent> {
    const stringified = await fs.readFile(this.getFilePath(), {
      encoding: "utf-8",
    });

    return JSON.parse(stringified);
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
}

export default LogFile;
