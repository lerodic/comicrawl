import "reflect-metadata";
import WeebCentralCrawler from "../src/core/crawl/crawlers/WeebCentralCrawler";
import Chromium from "../src/core/crawl/Chromium";
import { ElementHandle, Page } from "puppeteer";
import {
  extractTitleFixtures,
} from "./fixtures/Crawler.fixtures";

describe("WeebCentralCrawler", () => {
  let crawler: WeebCentralCrawler;
  let mockPage: jest.Mocked<Page>;
  let mockChromium: jest.Mocked<Chromium>;

  beforeEach(() => {
    mockPage = {
      $eval: jest.fn(),
      $$eval: jest.fn(),
      $$: jest.fn(),
      close: jest.fn(),
      waitForSelector: jest.fn(),
      waitForNetworkIdle: jest.fn(),
    } as unknown as jest.Mocked<Page>;

    mockChromium = {
      openPage: jest.fn().mockReturnValue(mockPage),
      terminate: jest.fn(),
    } as unknown as jest.Mocked<Chromium>;

    crawler = new WeebCentralCrawler(mockChromium);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("extractTitle", () => {
    it.each(extractTitleFixtures)(
      "should return title: '$title' for URL: '$url'",
      async ({ url, title }) => {
        mockPage.$eval.mockResolvedValueOnce(title);

        const result = await crawler.extractTitle(url);

        expect(result).toStrictEqual(title);
        expect(mockPage.close).toHaveBeenCalled();
      }
    );
  });
});
