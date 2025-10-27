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
  sessionTerminated: void;
};

