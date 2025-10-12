import Comicrawl from "../../core/Comicrawl";
import Chromium from "../../core/crawl/Chromium";
import CrawlerFactory from "../../core/factories/CrawlerFactory";
import Logger from "../../core/io/Logger";
import ProgressManager from "../../core/io/ProgressManager";
import Prompt from "../../core/io/Prompt";
import { Crawler, CrawlerFactoryFn } from "../../types";
import CONFIG from "../app.config";
import TYPES from "./inversify.types";
import { Container } from "inversify";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Comicrawl>(TYPES.Comicrawl).to(Comicrawl);

  container.bind<Prompt>(TYPES.Prompt).to(Prompt);

  container.bind<Logger>(TYPES.Logger).to(Logger);

  container
    .bind<CrawlerFactory>(TYPES.CrawlerFactory)
    .to(CrawlerFactory)
    .inSingletonScope();

  container.bind<CrawlerFactoryFn>(TYPES.CrawlerFactoryFn).toFactory(() => {
    return (url: string) => {
      if (container.isBound(TYPES.Crawler)) {
        container.unbind(TYPES.Crawler);
      }

      for (const [_, hostInfo] of CONFIG.DOMAIN_MAP) {
        if (hostInfo.domains.some((domain) => url.startsWith(domain))) {
          container.bind<Crawler>(TYPES.Crawler).to(hostInfo.class);

          break;
        }
      }

      return container.get<Crawler>(TYPES.Crawler);
    };
  });

  container.bind<Chromium>(TYPES.Chromium).to(Chromium).inSingletonScope();

  container
    .bind<ProgressManager>(TYPES.ProgressManager)
    .to(ProgressManager)
    .inSingletonScope();

  return container;
}

const container = setupContainer();

export default container;
