import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import { Chapter, Crawler } from "../../../types";
import TYPES from "../../../config/inversify/inversify.types";
import Chromium from "../Chromium";
import { ElementHandle, Page } from "puppeteer";

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
    const page = await this.chromium.openPage(url, "networkidle0");

    try {
      await this.attemptToLoadAdditionalChapters(page);

      return await this.getAllChapterLinks(page);
    } finally {
      await page.close();
    }
  }

  private async attemptToLoadAdditionalChapters(page: Page) {
    const button = await this.getLoadChaptersButton(page);
    if (button) {
      await button.click();
    }

    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
  }

  private async getLoadChaptersButton(
    page: Page
  ): Promise<ElementHandle<HTMLButtonElement> | undefined> {
    const buttons = await page.$$("button");

    for (const btn of buttons) {
      const text = await btn.evaluate(
        (b) => b.textContent?.toLowerCase() ?? ""
      );
      if (text.includes("show all chapters")) {
        return btn;
      }
    }
  }

  private async getAllChapterLinks(page: Page) {
    return await page.$$eval("a", (links) => {
      return links
        .map((link) => ({
          url: link.getAttribute("href") ?? "",
          title: link.querySelector("span span")?.textContent ?? "",
        }))
        .filter((link) =>
          link.url?.startsWith("https://weebcentral.com/chapters")
        )
        .reverse();
    });
  }

  async extractImageLinks(url: string): Promise<string[]> {
    const page = await this.chromium.openPage(url, "networkidle0");

    try {
      return await page.$$eval("img.maw-w-full", (images) => {
        return images
          .filter((image) => image.getAttribute("alt")?.startsWith("Page"))
          .map((image) => image.src);
      });
    } finally {
      await page.close();
    }
  }

  async terminate() {
    await this.chromium.terminate();
  }
}

export default WeebCentralCrawler;
