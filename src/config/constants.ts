import chalk from "chalk";
import BatoCrawler from "../core/crawl/crawlers/BatoCrawler";
import ProgressBar from "../core/io/ProgressBar";
import { DomainMap, HostInfo, SupportedHost } from "../types";

function createDomainMap(): DomainMap {
  const domainMap = new Map<SupportedHost, HostInfo>();

  domainMap.set("Bato", {
    domains: ["https://bato.to", "https://xbato.com"],
    class: BatoCrawler,
  });

  return domainMap;
}

function extractSupportedDomains(map: DomainMap): string[] {
  const supportedDomains: string[] = [];

  for (const value of map.values()) {
    supportedDomains.push(...value.domains);
  }

  return supportedDomains;
}

export const DOMAIN_MAP = createDomainMap();

export const SUPPORTED_DOMAINS = extractSupportedDomains(DOMAIN_MAP);

export const DOWNLOAD_OPTIONS = ["All", "Partial", "Selective"] as const;

export const PREPARATION_PROGRESS_BAR = new ProgressBar(
  chalk.greenBright,
  1,
  (_) => "Preparing chapters"
);

