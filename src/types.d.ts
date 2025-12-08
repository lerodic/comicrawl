import { Newable } from "inversify";
import { DOWNLOAD_OPTIONS } from "./config/constants";

export type SupportedSource = "Bato" | "WeebCentral";

export interface Source {
  id: SupportedSource;
  origins: string[];
  class: Newable<Crawler>;
}

export type SourceMap = Map<SupportedSource, SourceInfo>;

export interface Crawler {
  extractTitle(url: string): Promise<string>;
  extractChapters(url: string): Promise<Chapter[]>;
  extractImageLinks(url: string): Promise<string[]>;
  terminate(): Promise<void>;
}

export type CrawlerFactoryFn = (url: string) => Crawler;

export interface Chapter {
  title: string;
  url: string;
}

export type DownloadableChapter = Chapter & {
  images: string[];
};

export type PreparedChapter = Chapter & {
  images: ImageInfo[];
};

export interface DownloadInfo {
  url: string;
  title: string;
  chapters: PreparedChapter[];
}

export interface ProgressInfo {
  title?: string;
  itemsTotal: number;
  itemsCompleted: number;
}

export interface SessionStarted {
  title: string;
  url: string;
}

export interface DownloadFailed {
  chapter: Chapter;
  image: ImageInfo;
}

export interface LogFileContent {
  comic?: ComicInfo;
  createdAt: Date;
  failedDownloads: FailedDownloads;
  sourceOfTermination: SourceOfTermination;
}

export interface ComicInfo {
  title: string;
  url: string;
}

export type DefiniteLogFileContent = Required<LogFileContent>;

export interface ImageInfo {
  index: number;
  url: string;
}

export type SourceOfTermination = "User" | "Error" | "Program";

export type FailedDownloads = Record<string, ImageInfo[]>;

export interface LogFileUpdate {
  comic?: {
    title: string;
    url: string;
  };
  failedDownloads?: FailedDownloads;
  sourceOfTermination?: SourceOfTermination;
}

export interface Mode {
  run: () => Promise<void>;
}

export type ModeFactoryFn = (shouldRetryFailedDownloads: boolean) => Mode;
