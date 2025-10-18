import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import { Crawler, CrawlerFactoryFn } from "../../types";
import CrawlerInitializationFailed from "../error/errors/CrawlerInitializationFailed";

@boundClass
@injectable()
class CrawlerFactory {
  private crawler: Crawler | undefined = undefined;

  constructor(
    @inject(TYPES.CrawlerFactoryFn)
    private readonly createCrawler: CrawlerFactoryFn
  ) {}

  getCrawler(url: string | undefined = undefined): Crawler {
    if (!this.crawler && !url) {
      throw new CrawlerInitializationFailed();
    }

    if (!this.crawler) {
      this.crawler = this.createCrawler(url as string);
    }

    return this.crawler;
  }
}

export default CrawlerFactory;
