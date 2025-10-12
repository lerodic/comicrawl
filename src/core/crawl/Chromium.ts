import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import puppeteer, { Browser, PuppeteerLifeCycleEvent } from "puppeteer";
import CONFIG from "../../config/app.config";
import MissingChromiumInstance from "../errors/MissingChromiumInstance";

@boundClass
@injectable()
class Chromium {
  private browser: Browser | undefined = undefined;

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

    return page;
  }

  private async openNewPage() {
    const browser = await this.launchBrowser();

    return browser.newPage();
  }

  private async launchBrowser() {
    if (!this.browser) {
      this.browser = this.shouldUseBundledInstance()
        ? await this.launchBundledChromiumInstance()
        : await this.launchCustomChromiumInstance();
    }

    return this.browser;
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

  async terminate() {
    await this.browser?.close();
  }
}

export default Chromium;
