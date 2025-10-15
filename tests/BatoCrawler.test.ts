import "reflect-metadata";
import BatoCrawler from "../src/core/crawl/crawlers/BatoCrawler";
import Chromium from "../src/core/crawl/Chromium";
import { Page } from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";

jest.mock("cheerio");

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
      terminate: jest.fn(),
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
        jest.spyOn(axios, "get").mockResolvedValue({});
        (cheerio.load as jest.Mock).mockReturnValue(() => {
          return {
            text: () => title,
          };
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
            relativeLink: "/chapter1",
            textContent: "Chapter 1",
          },
          {
            href: "https://test.com/chapter2",
            relativeLink: "/chapter2",
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
      jest.spyOn(axios, "get").mockResolvedValue({});
      const $ = jest.fn(() => ({
        map: jest.fn().mockImplementation((cb) => ({
          get: jest.fn().mockImplementation(() => chapters),
        })),
      }));
      (cheerio.load as jest.Mock).mockReturnValue($);

      const result = await crawler.extractChapters(url);

      expect(result).toStrictEqual(chapters);
    });
  });

  describe("terminate", () => {
    it("should delegate to 'Chromium' instance for application shutdown", async () => {
      await crawler.terminate();

      expect(mockChromium.terminate).toHaveBeenCalled();
    });
  });

  describe("extractImageLinks", () => {
    it.each([
      {
        images: [
          {
            src: "https://example.com/chapter-1/image-1",
          },
          {
            src: "https://example.com/chapter-1/image-2",
          },
          {
            src: "https://example.com/chapter-1/image-3",
          },
        ],
        url: "https://example.com",
      },
    ])("should extract image links correctly", async ({ url, images }) => {
      const imageLinks = images.map((image) => image.src);
      mockPage.$$eval.mockResolvedValueOnce(imageLinks);

      const result = await crawler.extractImageLinks(url);

      expect(result).toStrictEqual(imageLinks);
      expect(mockPage.close).toHaveBeenCalled();
    });
  });
});
