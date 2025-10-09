import { Newable } from "inversify";

export type SupportedHost = "Bato";

export interface HostInfo {
  domains: string[];
  class: Newable<Crawler>;
}

export type DomainMap = Map<SupportedHost, HostInfo>;

