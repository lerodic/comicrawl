import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { Chapter, Crawler } from "../../../types";
import TYPES from "../../../config/inversify/inversify.types";
import Chromium from "../Chromium";

@boundClass
@injectable()
class BatoCrawler implements Crawler {
  constructor(@inject(TYPES.Chromium) private chromium: Chromium) {}

  async extractTitle(url: string): Promise<string> {
    const page = await this.chromium.openPage(url);

    const title = await page.$eval("h3.item-title a", (anchor) => {
      return anchor.textContent ?? "Untitled";
    });

    return title;
  }

  async extractChapters(url: string): Promise<Chapter[]> {
    const page = await this.chromium.openPage(url);

    const chapters = await page.$$eval("a.chapt", (links) => {
      return links
        .map((link) => ({
          url: (link as HTMLAnchorElement).href,
          title: link.textContent as string,
        }))
        .reverse();
    });

    return chapters;
  }
}

export default BatoCrawler;
