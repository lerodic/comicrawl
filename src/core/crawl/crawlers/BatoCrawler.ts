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

    await page.close();

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

    await page.close();

    return chapters;
  }



  async extractImageLinks(url: string): Promise<string[]> {
    const page = await this.chromium.openPage(url);

    try {
      return await page.$$eval("img.page-img", (images) => {
        return images.map((image) => (image as HTMLImageElement).src);
      });
    } finally {
      await page.close();
    }
  }

  async terminate() {
    await this.chromium.terminate();
  }
}

export default BatoCrawler;
