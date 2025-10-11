import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Chromium from "../src/core/crawl/Chromium";
import Logger from "../src/core/io/Logger";

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPrompt: jest.Mocked<Prompt>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockChromium: jest.Mocked<Chromium>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockPrompt = {
      getUrl: jest.fn(),
      getDownloadOption: jest.fn(),
      getChaptersStartingAt: jest.fn(),
      getChaptersFromList: jest.fn(),
    } as unknown as jest.Mocked<Prompt>;

    mockCrawler = {
      extractTitle: jest.fn(),
      extractChapters: jest.fn(),
    } as unknown as jest.Mocked<Crawler>;

    mockCrawlerFactory = {
      getCrawler: jest.fn().mockReturnValue(mockCrawler),
    } as unknown as jest.Mocked<CrawlerFactory>;

    mockChromium = {
      terminate: jest.fn(),
    } as unknown as jest.Mocked<Chromium>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      logChapterRequest: jest.fn(),
      logChaptersFound: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    comicrawl = new Comicrawl(
      mockPrompt,
      mockCrawlerFactory,
      mockChromium,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it.each([
      {
        url: "https://example.com",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "example.com/chapter-1",
          },
        ],
      },
      {
        url: "https://test.com",
        title: "Manga 1",
        chapters: [
          {
            title: "First chapter",
            url: "test.com/first-chapter",
          },
        ],
      },
    ])(
      "should extract all chapters successfully",
      async ({ url, title, chapters }) => {
        const logSpy = jest.spyOn(console, "log");
        mockPrompt.getUrl.mockResolvedValue(url);
        mockPrompt.getDownloadOption.mockResolvedValue("All");
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);

        await comicrawl.run();

        expect(mockCrawler.extractTitle).toHaveBeenCalled();
        expect(mockCrawler.extractChapters).toHaveBeenCalled();
        expect(logSpy).toHaveBeenNthCalledWith(1, title);
        expect(logSpy).toHaveBeenNthCalledWith(2, chapters);
        expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
      }
    );

    it.each([
      {
        url: "https://example.com",
        title: "Comic 1",
        startingAt: 1,
        chapters: [
          {
            title: "Chapter 1",
            url: "example.com/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "example.com/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "example.com/chapter-3",
          },
        ],
      },
      {
        url: "https://test.com",
        title: "Manga 1",
        startingAt: 2,
        chapters: [
          {
            title: "First chapter",
            url: "test.com/first-chapter",
          },
          {
            title: "Second chapter",
            url: "test.com/second-chapter",
          },
          {
            title: "Third chapter",
            url: "test.com/third-chapter",
          },
        ],
      },
    ])(
      "should extract all chapters starting at $startingAt successfully",
      async ({ url, title, chapters, startingAt }) => {
        const logSpy = jest.spyOn(console, "log");
        const extractedChapters = chapters.slice(startingAt - 1);
        mockPrompt.getUrl.mockResolvedValue(url);
        mockPrompt.getDownloadOption.mockResolvedValue("Partial");
        mockPrompt.getChaptersStartingAt.mockResolvedValue(startingAt);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);

        await comicrawl.run();

        expect(mockCrawler.extractTitle).toHaveBeenCalled();
        expect(mockCrawler.extractChapters).toHaveBeenCalled();
        expect(logSpy).toHaveBeenNthCalledWith(1, title);
        expect(logSpy).toHaveBeenNthCalledWith(2, extractedChapters);
        expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
      }
    );

    it.each([
      {
        url: "https://example.com",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "example.com/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "example.com/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "example.com/chapter-3",
          },
        ],
        selected: ["Chapter 2"],
      },
    ])(
      "should extract all selected chapters successfully",
      async ({ url, title, chapters, selected }) => {
        const logSpy = jest.spyOn(console, "log");
        const extractedChapters = chapters.filter((chapter) =>
          selected.includes(chapter.title)
        );
        mockPrompt.getUrl.mockResolvedValue(url);
        mockPrompt.getDownloadOption.mockResolvedValue("Selective");
        mockPrompt.getChaptersFromList.mockResolvedValue(selected);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);

        await comicrawl.run();

        expect(mockCrawler.extractTitle).toHaveBeenCalled();
        expect(mockCrawler.extractChapters).toHaveBeenCalled();
        expect(logSpy).toHaveBeenNthCalledWith(1, title);
        expect(logSpy).toHaveBeenNthCalledWith(2, extractedChapters);
        expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
      }
    );

    it.each([
      {
        title: "Chapterless comic",
        url: "example.com",
      },
    ])(
      "should exit prematurely if graphic novel does not contain any chapters",
      async ({ title, url }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockPrompt.getDownloadOption.mockResolvedValue("All");
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue([]);

        await comicrawl.run();

        expect(mockLogger.error).toHaveBeenCalledWith(
          `${title} is empty. Aborting.`
        );
        expect(mockChromium.terminate).toHaveBeenCalledTimes(1);
      }
    );

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
