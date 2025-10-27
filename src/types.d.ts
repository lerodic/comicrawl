import { Newable } from "inversify";
import { DOWNLOAD_OPTIONS } from "./config/constants";
import emitter from "./core/events/emitter";

export type SupportedHost = "Bato";

export interface HostInfo {
  domains: string[];
  class: Newable<Crawler>;
}

export type DomainMap = Map<SupportedHost, HostInfo>;

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
  imageLinks: string[];
};

export type DownloadOption = (typeof DOWNLOAD_OPTIONS)[number];

export interface DownloadInfo {
  url: string;
  title: string;
  chapters: DownloadableChapter[];
}

export interface ProgressInfo {
  title?: string;
  itemsTotal: number;
  itemsCompleted: number;
}

export type EventEmitter = typeof emitter;

export type ComicrawlEvents = {
  sessionStarted: SessionStarted;
  downloadFailed: DownloadFailed;
  sessionTerminated: void;
};

export interface SessionStarted {
  title: string;
  url: string;
}

export interface DownloadFailed {
  chapter: Chapter;
  image: ImageInfo;
}

export interface LogFileContent {
  comic: {
    title: string | undefined;
    url: string | undefined;
  };
  createdAt: Date;
  failedDownloads: FailedDownloads;
  sourceOfTermination: SourceOfTermination;
}

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
