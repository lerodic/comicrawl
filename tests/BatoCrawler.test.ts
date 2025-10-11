import "reflect-metadata";
import BatoCrawler from "../src/core/crawl/crawlers/BatoCrawler";
import Chromium from "../src/core/crawl/Chromium";
import { Page } from "puppeteer";

describe("BatoCrawler", () => {
  let crawler: BatoCrawler;
  let mockPage: jest.Mocked<Page>;
  let mockChromium: jest.Mocked<Chromium>;

  beforeEach(() => {
    mockPage = {
      $eval: jest.fn(),
      $$eval: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Page>;

    mockChromium = {
      openPage: jest.fn().mockReturnValue(mockPage),
    } as unknown as jest.Mocked<Chromium>;

    crawler = new BatoCrawler(mockChromium);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("extractTitle", () => {
    it.each([
      {
        url: "https://example.com",
        title: "First Manga",
      },
      {
        url: "https://another-example.com",
        title: "Second Manga",
      },
    ])(
      "should return title: '$title' for URL: '$url'",
      async ({ url, title }) => {
        mockPage.$eval.mockImplementationOnce((_selector: string, fn: any) => {
          return fn({ textContent: title });
        });

        const result = await crawler.extractTitle(url);

        expect(result).toStrictEqual(title);
      }
    );
  });

  describe("extractChapters", () => {
    it.each([
      {
        url: "https://test.com",
        links: [
          {
            href: "https://test.com/chapter1",
            textContent: "Chapter 1",
          },
          {
            href: "https://test.com/chapter2",
            textContent: "Chapter 2",
          },
        ],
      },
    ])("should extract chapters correctly", async ({ url, links }) => {
      const chapters = links
        .map((link) => ({
          url: link.href,
          title: link.textContent,
        }))
        .reverse();
      mockPage.$$eval.mockResolvedValueOnce(chapters);

      const result = await crawler.extractChapters(url);

      expect(result).toStrictEqual(chapters);
    });
  });
});
