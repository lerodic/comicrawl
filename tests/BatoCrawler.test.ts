import "reflect-metadata";
import BatoCrawler from "../src/core/crawl/crawlers/BatoCrawler";
import Chromium from "../src/core/crawl/Chromium";
import { Page } from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  extractChaptersFixtures,
  extractImageLinksFixtures,
  extractTitleFixtures,
} from "./fixtures/BatoCrawler.fixtures";

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
    it.each(extractTitleFixtures)(
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
    it.each(extractChaptersFixtures)(
      "should extract chapters correctly",
      async ({ url, links }) => {
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
      }
    );
  });

  describe("terminate", () => {
    it("should delegate to 'Chromium' instance for application shutdown", async () => {
      await crawler.terminate();

      expect(mockChromium.terminate).toHaveBeenCalled();
    });
  });

  describe("extractImageLinks", () => {
    it.each(extractImageLinksFixtures)(
      "should extract image links correctly",
      async ({ url, images }) => {
        const imageLinks = images.map((image) => image.src);
        mockPage.$$eval.mockResolvedValueOnce(imageLinks);

        const result = await crawler.extractImageLinks(url);

        expect(result).toStrictEqual(imageLinks);
        expect(mockPage.close).toHaveBeenCalled();
      }
    );
  });
});
