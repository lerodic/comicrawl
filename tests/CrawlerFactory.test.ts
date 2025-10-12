import "reflect-metadata";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import type { CrawlerFactoryFn, Crawler } from "../src/types";
import CrawlerInitializationFailed from "../src/core/errors/CrawlerInitializationFailed";

describe("CrawlerFactory", () => {
  let crawlerFactory: CrawlerFactory;
  let mockCrawlerFactoryFn: jest.Mocked<CrawlerFactoryFn>;
  let mockCrawler: jest.Mocked<Crawler>;

  beforeEach(() => {
    mockCrawler = {} as unknown as jest.Mocked<Crawler>;

    mockCrawlerFactoryFn = jest.fn().mockReturnValue(mockCrawler);

    crawlerFactory = new CrawlerFactory(mockCrawlerFactoryFn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCrawler", () => {
    it("should resolve return new crawler", () => {
      const result = crawlerFactory.getCrawler("example.com");

      expect(result).toStrictEqual(mockCrawler);
      expect(mockCrawlerFactoryFn).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if no crawler has been initialized yet and no URL is passed along", () => {
      expect(() => crawlerFactory.getCrawler()).toThrow(
        CrawlerInitializationFailed
      );
    });

    it("should return existing crawler", () => {
      (crawlerFactory as any).crawler = {} as unknown as Crawler;

      const result = crawlerFactory.getCrawler("");

      expect(result).toStrictEqual(mockCrawler);
      expect(mockCrawlerFactoryFn).not.toHaveBeenCalled();
    });
  });
});
