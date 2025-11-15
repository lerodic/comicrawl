import "reflect-metadata";
import WeebCentralCrawler from "../src/core/crawl/crawlers/WeebCentralCrawler";
import Chromium from "../src/core/crawl/Chromium";
import { ElementHandle, Page } from "puppeteer";
import {
  extractTitleFixtures,
  extractChaptersFixtures,
  extractImageLinksFixtures,
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

  describe("extractChapters", () => {
    it.each(extractChaptersFixtures)(
      "should extract all chapters even if not all chapters are present on initial load",
      async ({ url, links }) => {
        const mockButton = {
          evaluate: jest.fn(),
          click: jest.fn(),
        } as any;
        mockPage.$$.mockResolvedValueOnce([mockButton]);
        mockButton.evaluate.mockResolvedValueOnce("show all chapters");
        mockPage.$$eval.mockResolvedValueOnce(links);

        const result = await crawler.extractChapters(url);

        expect(mockButton.click).toHaveBeenCalled();
        expect(mockPage.waitForNetworkIdle).toHaveBeenCalledWith({
          idleTime: 500,
          timeout: 5000,
        });
        expect(result).toStrictEqual(links);
      }
    );

    it.each(extractChaptersFixtures)(
      "should extract all chapters if all chapters are present on initial load",
      async ({ url, links }) => {
        const mockButton = {
          evaluate: jest.fn(),
          click: jest.fn(),
        } as any;
        mockPage.$$.mockResolvedValueOnce([mockButton]);
        mockButton.evaluate.mockResolvedValueOnce("nope");
        mockPage.$$eval.mockResolvedValueOnce(links);

        const result = await crawler.extractChapters(url);

        expect(result).toStrictEqual(links);
        expect(mockButton.click).not.toHaveBeenCalled();
        expect(mockPage.waitForNetworkIdle).toHaveBeenCalledWith({
          idleTime: 500,
          timeout: 5000,
        });
        expect(mockPage.close).toHaveBeenCalled();
      }
    );
  });

  describe("extractImageLinks", () => {
    it.each(extractImageLinksFixtures)(
      "should correctly extract all image links",
      async ({ url, images }) => {
        mockPage.$$eval.mockResolvedValueOnce(images);

        const result = await crawler.extractImageLinks(url);

        expect(result).toStrictEqual(images);
        expect(mockPage.close).toHaveBeenCalled();
      }
    );
  });

  describe("terminate", () => {
    it("should delegate to 'Chromium' instance for application shutdown", async () => {
      await crawler.terminate();

      expect(mockChromium.terminate).toHaveBeenCalled();
    });
  });
});
