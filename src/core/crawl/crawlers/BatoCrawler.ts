import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { Chapter, Crawler } from "../../../types";
import TYPES from "../../../config/inversify/inversify.types";
import Chromium from "../Chromium";
import axios from "axios";
import { load } from "cheerio";

@boundClass
@injectable()
class BatoCrawler implements Crawler {
  constructor(@inject(TYPES.Chromium) private chromium: Chromium) {}

  async extractTitle(url: string): Promise<string> {
    const res = await axios.get(url);
    const $ = load(res.data);

    return $("h3.item-title a").text() ?? "Untitled";
  }

  async extractChapters(url: string): Promise<Chapter[]> {
    const domain = this.extractDomain(url);
    const res = await axios.get(url);
    const $ = load(res.data);

    const chapters = $("a.chapt")
      .map((_, link) => {
        const relativeLink = $(link).attr("href") ?? "";

        return {
          url: `${domain}${relativeLink}`,
          title: $(link).text().replace(/\s+/g, " ").trim() ?? "",
        };
      })
      .get()
      .reverse();

    return chapters;
  }

  private extractDomain(url: string): string {
    const { protocol, host } = new URL(url);

    return `${protocol}//${host}`;
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
