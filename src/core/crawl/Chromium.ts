import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import puppeteer, { Browser, PuppeteerLifeCycleEvent } from "puppeteer";
import CONFIG from "../../config/app.config";
import MissingChromiumInstance from "../errors/MissingChromiumInstance";
import { PuppeteerBlocker } from "@ghostery/adblocker-puppeteer";

@boundClass
@injectable()
class Chromium {
  private browserLaunchPromise: Promise<Browser> | undefined = undefined;
  private browser: Browser | undefined = undefined;
  private blocker: PuppeteerBlocker | undefined = undefined;

  async openPage(
    url: string,
    waitUntil: PuppeteerLifeCycleEvent = "domcontentloaded"
  ) {
    const page = await this.setupPage();

    await page.goto(url, {
      waitUntil,
      timeout: 0,
    });

    return page;
  }

  private async setupPage() {
    const page = await this.openNewPage();

    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);
    await this.initBlocker();
    await this.blocker!.enableBlockingInPage(page);

    return page;
  }

  private async openNewPage() {
    const browser = await this.launchBrowser();

    return browser.newPage();
  }

  private async launchBrowser() {
    if (this.browser) {
      return this.browser;
    }

    if (this.browserLaunchPromise) {
      return this.browserLaunchPromise;
    }

    this.browserLaunchPromise = (async () => {
      this.browser = this.shouldUseBundledInstance()
        ? await this.launchBundledChromiumInstance()
        : await this.launchCustomChromiumInstance();

      this.browserLaunchPromise = undefined;

      return this.browser;
    })();

    return this.browserLaunchPromise;
  }

  private shouldUseBundledInstance(): boolean {
    return !CONFIG.EXECUTABLE_PATH;
  }

  private async launchBundledChromiumInstance() {
    return puppeteer.launch();
  }

  private async launchCustomChromiumInstance() {
    try {
      return puppeteer.launch({ executablePath: CONFIG.EXECUTABLE_PATH });
    } catch {
      throw new MissingChromiumInstance(CONFIG.EXECUTABLE_PATH!);
    }
  }

  private async initBlocker() {
    if (!this.blocker) {
      this.blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
    }
  }

  async terminate() {
    if (!this.browser) {
      return;
    }

    await this.closeOpenPages();
    await this.closeBrowser();
  }

  private async closeOpenPages() {
    const openPages = await this.browser?.pages();
    if (!openPages) {
      return;
    }

    for (const page of openPages) {
      await page.close();
    }
  }

  private async closeBrowser() {
    await this.browser?.close();
    this.browser = undefined;
  }
}

export default Chromium;
