import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { Crawler } from "../../../types";
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
}

export default BatoCrawler;
