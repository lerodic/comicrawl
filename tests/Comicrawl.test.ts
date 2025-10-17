import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Logger from "../src/core/io/Logger";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";
import PreparationService from "../src/core/download/PreparationService";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
import DownloadService from "../src/core/download/DownloadService";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPreparationService: jest.Mocked<PreparationService>;
  let mockDownloadService: jest.Mocked<DownloadService>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockPreparationService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<PreparationService>;

    mockDownloadService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<DownloadService>;

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
      error: jest.fn(),
      logChaptersFound: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    comicrawl = new Comicrawl(
      mockPreparationService,
      mockDownloadService,
      mockCrawlerFactory,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    describe("download whole comic", () => {
      it.each([
        {
          title: "Comic 1",
          chapters: [
            {
              title: "Chapter 1",
              url: "example.com/chapter-1",
              imageLinks: ["img1", "img2", "img3"],
            },
            {
              title: "Chapter 2",
              url: "example.com/chapter-2",
              imageLinks: ["img1", "img2", "img3", "img4"],
            },
            {
              title: "Chapter 3",
              url: "example.com/chapter-3",
              imageLinks: ["img1", "img2", "img3"],
            },
          ],
        },
      ])("should execute correctly", async ({ title, chapters }) => {
        mockPreparationService.start.mockResolvedValue({ title, chapters });

        await comicrawl.run();

        expect(mockDownloadService.start).toHaveBeenCalledWith(title, chapters);
        expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
      });
    });

    it("should exit early if graphic novel does not contain any chapters", async () => {
      mockPreparationService.start.mockImplementation(() => {
        throw new EmptyGraphicNovel("Chapterless comic");
      });

      await comicrawl.run();

      expect(mockLogger.error).toHaveBeenCalledWith(
        `\n'Chapterless comic' is empty. Aborting.`
      );
      expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
    });

    it("should exit early if crawler initialization fails", async () => {
      mockPreparationService.start.mockImplementationOnce(() => {
        throw new CrawlerInitializationFailed();
      });

      await comicrawl.run();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "\nFailed to initialize crawler. Please try again.\n"
      );
      expect(mockCrawler.terminate).toHaveBeenCalled();
    });

    it("should terminate correctly on unexpected error", async () => {
      mockPreparationService.start.mockImplementationOnce(() => {
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
