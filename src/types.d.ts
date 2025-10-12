import { Newable } from "inversify";
import { DOWNLOAD_OPTIONS } from "./config/constants";

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

export type DownloadOption = (typeof DOWNLOAD_OPTIONS)[number];
