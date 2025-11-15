import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { Chapter, Crawler } from "../../../types";
import TYPES from "../../../config/inversify/inversify.types";
import Chromium from "../Chromium";

@boundClass
@injectable()
class WeebCentralCrawler implements Crawler {
  constructor(@inject(TYPES.Chromium) private chromium: Chromium) {}

  async extractTitle(url: string): Promise<string> {
    return "";
  }

  async extractChapters(url: string): Promise<Chapter[]> {
    return [];
  }

  async extractImageLinks(url: string): Promise<string[]> {
    return [];
  }

  async terminate() {
    await this.chromium.terminate();
  }
}

export default WeebCentralCrawler;
