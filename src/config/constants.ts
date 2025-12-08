import chalk from "chalk";
import BatoCrawler from "../core/crawl/crawlers/BatoCrawler";
import ProgressBar from "../core/io/progress/ProgressBar";
import { Source } from "../types";
import WeebCentralCrawler from "../core/crawl/crawlers/WeebCentralCrawler";

export const SOURCES: Source[] = [
  {
    id: "Bato",
    origins: ["https://bato.to", "https://xbato.com"],
    class: BatoCrawler,
  },
  {
    id: "WeebCentral",
    origins: ["https://weebcentral.com"],
    class: WeebCentralCrawler,
  },
];

export const SUPPORTED_ORIGINS = extractSupportedOrigins(SOURCES);

function extractSupportedOrigins(sources: Source[]): string[] {
  return sources.map((source) => source.origins).flat();
}

export enum DownloadOption {
  All,
  Partial,
  Range,
  Selective,
}

export const DOWNLOAD_OPTIONS = Object.values(DownloadOption)
  .filter((v) => typeof v === "string")
  .map((key) => {
    const downloadOption = DownloadOption[key as keyof typeof DownloadOption];

    return {
      name: getDownloadOptionName(downloadOption),
      value: downloadOption,
    };
  });

function getDownloadOptionName(downloadOption: DownloadOption): string {
  switch (downloadOption) {
    case DownloadOption.All:
      return "all chapters";
    case DownloadOption.Partial:
      return `all chapters, starting at ${chalk.magentaBright.bold("[x]")}`;
    case DownloadOption.Range:
      return `all chapters in between ${chalk.magentaBright.bold(
        "[x]"
      )} and ${chalk.magentaBright.bold("[y]")}`;
    case DownloadOption.Selective:
      return "a selection of chapters";
  }
}

export const PREPARATION_PROGRESS_BAR = new ProgressBar(
  chalk.greenBright,
  1,
  (_) => "Preparing chapters"
);

export const COMIC_PROGRESS_BAR = new ProgressBar(
  chalk.greenBright,
  2,
  (title: string) => title
);

export const CHAPTER_PROGRESS_BAR = new ProgressBar(
  chalk.yellowBright,
  1,
  (_) => "Downloading images"
);
