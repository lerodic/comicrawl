import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import Prompt from "./io/Prompt";
import CrawlerFactory from "./factories/CrawlerFactory";
import Chromium from "./crawl/Chromium";

@boundClass
@injectable()
class Comicrawl {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.CrawlerFactory) private crawlerFactory: CrawlerFactory,
    @inject(TYPES.Chromium) private chromium: Chromium
  ) {}

  async run() {
    try {
      const { title } = await this.prepareDownload();
      console.log(title);
    } catch {
    }

    await this.shutdown();
  }

  private async prepareDownload() {
    const url = await this.prompt.getUrl();
    const title = await this.crawlerFactory.getCrawler(url).extractTitle(url);

    return { title };
  }

  private async shutdown() {
    await this.chromium.terminate();
  }
}

export default Comicrawl;
