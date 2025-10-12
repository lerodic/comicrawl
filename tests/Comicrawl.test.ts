import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Logger from "../src/core/io/Logger";
import ProgressManager from "../src/core/io/ProgressManager";
import CrawlerInitializationFailed from "../src/core/errors/CrawlerInitializationFailed";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPrompt: jest.Mocked<Prompt>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockLogger: jest.Mocked<Logger>;
  let mockProgressManager: jest.Mocked<ProgressManager>;

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
      extractImageLinks: jest.fn(),
      terminate: jest.fn(),
    } as unknown as jest.Mocked<Crawler>;

    mockCrawlerFactory = {
      getCrawler: jest.fn().mockReturnValue(mockCrawler),
    } as unknown as jest.Mocked<CrawlerFactory>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      logChapterRequest: jest.fn(),
      logChaptersFound: jest.fn(),
      logDownloadStarted: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockProgressManager = {
      createChapterPreparationBar: jest.fn(),
      advanceChapterPreparation: jest.fn(),
      completeChapterPreparation: jest.fn(),
    } as unknown as jest.Mocked<ProgressManager>;

    comicrawl = new Comicrawl(
      mockPrompt,
      mockCrawlerFactory,
      mockLogger,
      mockProgressManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it("should extract all chapters successfully", async () => {
      const url = "https://example.com";
      const title = "Comic 1";
      const chapters = [
        {
          title: "Chapter 1",
          url: "example.com/chapter-1",
        },
      ];
      const imageLinks = ["img1", "img2", "img3"];

      mockPrompt.getUrl.mockResolvedValue(url);
      mockPrompt.getDownloadOption.mockResolvedValue("All");
      mockCrawler.extractTitle.mockResolvedValue(title);
      mockCrawler.extractChapters.mockResolvedValue(chapters);
      mockCrawler.extractImageLinks.mockResolvedValue(imageLinks);

      await comicrawl.run();

      expect(mockLogger.logChapterRequest).toHaveBeenCalled();
      expect(mockCrawler.extractTitle).toHaveBeenCalledWith(url);
      expect(mockCrawler.extractChapters).toHaveBeenCalledWith(url);
      expect(
        mockProgressManager.createChapterPreparationBar
      ).toHaveBeenCalledWith(title, chapters.length);
      expect(mockProgressManager.advanceChapterPreparation).toHaveBeenCalled();
      expect(mockProgressManager.completeChapterPreparation).toHaveBeenCalled();
      expect(mockLogger.logDownloadStarted).toHaveBeenCalledWith(
        title,
        chapters.length
      );
      expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
    });

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
      "should extract chapters successfully when downloadOption = 'Partial'",
      async () => {
        const url = "https://example.com";
        const title = "First Comic";
        const chapters = [
          { title: "Chapter 1", url: "c1" },
          { title: "Chapter 2", url: "c2" },
          { title: "Chapter 3", url: "c3" },
        ];

        mockPrompt.getUrl.mockResolvedValue(url);
        mockPrompt.getDownloadOption.mockResolvedValue("Partial");
        mockPrompt.getChaptersStartingAt.mockResolvedValue(2);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockCrawler.extractImageLinks.mockResolvedValue([]);

        await comicrawl.run();

        expect(mockPrompt.getChaptersStartingAt).toHaveBeenCalledWith(chapters);
        expect(mockLogger.logDownloadStarted).toHaveBeenCalledWith(title, 2);
        expect(mockCrawler.terminate).toHaveBeenCalled();
      }
    );

    it("should correctly extract chapters when downloadOption = 'Selective'", async () => {
      const url = "https://test.com";
      const title = "Comic 1";
      const chapters = [
        {
          title: "Chapter 1",
          url: "test.com/chapter-1",
        },
        {
          title: "Chapter 2",
          url: "test.com/chapter-2",
        },
        {
          title: "Chapter 3",
          url: "test.com/chapter-3",
        },
      ];
      const selected = ["Chapter 2"];

      mockPrompt.getUrl.mockResolvedValue(url);
      mockPrompt.getDownloadOption.mockResolvedValue("Selective");
      mockPrompt.getChaptersFromList.mockResolvedValue(selected);
      mockCrawler.extractTitle.mockResolvedValue(title);
      mockCrawler.extractChapters.mockResolvedValue(chapters);
      mockCrawler.extractImageLinks.mockResolvedValue([]);

      await comicrawl.run();

      expect(mockPrompt.getChaptersFromList).toHaveBeenCalledWith(chapters);
      expect(mockLogger.logDownloadStarted).toHaveBeenCalledWith(title, 1);
      expect(mockCrawler.terminate).toHaveBeenCalled();
    });

    it("should exit early if graphic novel does not contain any chapters", async () => {
      const title = "Chapterless comic";
      const url = "test.com";
      mockPrompt.getUrl.mockResolvedValue(url);
      mockPrompt.getDownloadOption.mockResolvedValue("All");
      mockCrawler.extractTitle.mockResolvedValue(title);
      mockCrawler.extractChapters.mockResolvedValue([]);

      await comicrawl.run();

      expect(mockLogger.error).toHaveBeenCalledWith(
        `\n${title} is empty. Aborting.`
      );
      expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
    });

    it("should exit early if crawler initialization fails", async () => {
      mockPrompt.getUrl.mockResolvedValue("test.com");
      mockCrawlerFactory.getCrawler.mockImplementationOnce(() => {
        throw new CrawlerInitializationFailed();
      });

      await comicrawl.run();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "\nFailed to initialize crawler. Please try again.\n"
      );
      expect(mockCrawler.terminate).toHaveBeenCalled();
    });

    it("should terminate correctly on unexpected error", async () => {
      mockPrompt.getUrl.mockImplementationOnce(() => {
        throw new Error();
      });

      await comicrawl.run();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "\nSomething unexpected happened."
      );
      expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
    });
  });
});
