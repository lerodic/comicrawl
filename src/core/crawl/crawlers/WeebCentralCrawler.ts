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
    const page = await this.chromium.openPage(url, "networkidle0");

    try {
      await page.waitForSelector("h1", { timeout: 5000 });

      return await page.$eval(
        "h1",
        (heading) => heading.textContent ?? "Untitled"
      );
    } finally {
      await page.close();
    }
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
