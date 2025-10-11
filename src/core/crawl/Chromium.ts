import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import puppeteer, { Browser, Page, PuppeteerLifeCycleEvent } from "puppeteer";
import CONFIG from "../../config/app.config";
import MissingChromiumInstance from "../errors/MissingChromiumInstance";

@boundClass
@injectable()
class Chromium {
  private browser: Browser | undefined = undefined;
  private page: Page | undefined = undefined;

  async openPage(
    url: string,
    waitUntil: PuppeteerLifeCycleEvent = "domcontentloaded"
  ) {
    this.page = await this.setupPage();

    await this.page.goto(url, {
      waitUntil,
      timeout: 0,
    });

    return this.page;
  }

  private async setupPage() {
    const page = await this.openNewPage();

    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);

    return page;
  }

  private async openNewPage() {
    this.browser = this.shouldUseBundledInstance()
      ? await this.launchBundledChromiumInstance()
      : await this.launchCustomChromiumInstance();

    return this.browser.newPage();
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

    this.page = undefined;
    this.browser = undefined;
  }
}

export default Chromium;
