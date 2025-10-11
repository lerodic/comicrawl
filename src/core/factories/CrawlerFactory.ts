import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../../config/inversify/inversify.types";
import { Crawler, CrawlerFactoryFn } from "../../types";

@boundClass
@injectable()
class CrawlerFactory {
  constructor(
    @inject(TYPES.CrawlerFactoryFn)
    private readonly createCrawler: CrawlerFactoryFn
  ) {}

  getCrawler(url: string): Crawler {
    return this.createCrawler(url);
  }
}

export default CrawlerFactory;
