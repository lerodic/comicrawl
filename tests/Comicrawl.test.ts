import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Chromium from "../src/core/crawl/Chromium";

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPrompt: jest.Mocked<Prompt>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockChromium: jest.Mocked<Chromium>;

  beforeEach(() => {
    mockPrompt = {
      getUrl: jest.fn(),
    } as unknown as jest.Mocked<Prompt>;

    mockCrawler = {
      extractTitle: jest.fn(),
    } as unknown as jest.Mocked<Crawler>;

    mockCrawlerFactory = {
      getCrawler: jest.fn().mockReturnValue(mockCrawler),
    } as unknown as jest.Mocked<CrawlerFactory>;

    mockChromium = {
      terminate: jest.fn(),
    } as unknown as jest.Mocked<Chromium>;

    comicrawl = new Comicrawl(mockPrompt, mockCrawlerFactory, mockChromium);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it.each([
      {
        url: "https://example.com",
        title: "Comic 1",
      },
      {
        url: "https://test.com",
        title: "Manga 1",
      },
    ])("should execute correctly", async ({ url, title }) => {
      const logSpy = jest.spyOn(console, "log");
      mockPrompt.getUrl.mockResolvedValue(url);
      mockCrawler.extractTitle.mockResolvedValue(title);

      await comicrawl.run();

      expect(mockCrawler.extractTitle).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(title);
      expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
    });

    it("should terminate correctly on error", async () => {
      const logSpy = jest.spyOn(console, "log");
      mockPrompt.getUrl.mockImplementationOnce(() => {
        throw new Error();
      });

      await comicrawl.run();

      expect(logSpy).not.toHaveBeenCalled();
      expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
    });
  });
});
