import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Logger from "../src/core/io/Logger";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";
import fs from "fs/promises";
import download from "image-downloader";
import PreparationService from "../src/core/download/PreparationService";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPreparationService: jest.Mocked<PreparationService>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockLogger: jest.Mocked<Logger>;
  let mockProgressManager: jest.Mocked<ProgressManager>;
  let mkdirSpy = jest.spyOn(fs, "mkdir").mockImplementation();
  let imageSpy = jest.spyOn(download, "image").mockImplementation();

  beforeEach(() => {
    mockPreparationService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<PreparationService>;

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

    mockProgressManager = {
      createComicBar: jest.fn(),
      advanceComic: jest.fn(),
      completeComic: jest.fn(),
      createChapterBar: jest.fn(),
      advanceChapter: jest.fn(),
      completeChapter: jest.fn(),
    } as unknown as jest.Mocked<ProgressManager>;

    comicrawl = new Comicrawl(
      mockPreparationService,
      mockCrawlerFactory,
      mockLogger,
      mockProgressManager
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
      ])(
        "should correctly download whole comic",
        async ({ title, chapters }) => {
          const numTotalImages = chapters.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          mockPreparationService.start.mockResolvedValue({ title, chapters });

          await comicrawl.run();

          expect(mockProgressManager.createComicBar).toHaveBeenCalledWith(
            title,
            chapters.length
          );
          expect(mockProgressManager.advanceComic).toHaveBeenCalledTimes(
            chapters.length
          );
          expect(mkdirSpy).toHaveBeenCalledTimes(chapters.length);
          chapters.forEach((chapter, index) => {
            expect(
              mockProgressManager.createChapterBar
            ).toHaveBeenNthCalledWith(
              index + 1,
              chapter.title,
              chapter.imageLinks.length
            );
          });
          expect(mockProgressManager.advanceChapter).toHaveBeenCalledTimes(
            numTotalImages
          );
          expect(imageSpy).toHaveBeenCalledTimes(numTotalImages);
          expect(mockProgressManager.completeChapter).toHaveBeenCalled();
          expect(mockProgressManager.completeComic).toHaveBeenCalled();
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
        }
      );
    });

    describe("download chunk of comic", () => {
      it.each([
        {
          title: "Comic 1",
          startingAt: 1,
          expected: [
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
        {
          title: "Comic 2",
          startingAt: 2,
          expected: [
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
        {
          title: "Comic 3",
          startingAt: 3,
          expected: [
            {
              title: "Chapter 3",
              url: "example.com/chapter-3",
              imageLinks: ["img1", "img2", "img3"],
            },
          ],
        },
      ])(
        "should download chapters starting at $startingAt",
        async ({ title, expected }) => {
          const numTotalImages = expected.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          mockPreparationService.start.mockResolvedValue({
            title,
            chapters: expected,
          });

          await comicrawl.run();

          expect(mockProgressManager.createComicBar).toHaveBeenCalledWith(
            title,
            expected.length
          );
          expect(mockProgressManager.advanceComic).toHaveBeenCalledTimes(
            expected.length
          );
          expect(mkdirSpy).toHaveBeenCalledTimes(expected.length);
          expected.forEach((chapter, index) => {
            expect(
              mockProgressManager.createChapterBar
            ).toHaveBeenNthCalledWith(
              index + 1,
              chapter.title,
              chapter.imageLinks.length
            );
          });
          expect(mockProgressManager.advanceChapter).toHaveBeenCalledTimes(
            numTotalImages
          );
          expect(imageSpy).toHaveBeenCalledTimes(numTotalImages);
          expect(mockProgressManager.completeChapter).toHaveBeenCalled();
          expect(mockProgressManager.completeComic).toHaveBeenCalled();
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
        }
      );
    });

    describe("download chapters by selection", () => {
      it.each([
        {
          title: "Comic 1",
          selected: ["Chapter 1", "Chapter 2", "Chapter 3"],
          expected: [
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
        {
          title: "Comic 2",
          selected: ["Chapter 2", "Chapter 3"],
          expected: [
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
        {
          title: "Comic 3",
          selected: ["Chapter 3"],
          expected: [
            {
              title: "Chapter 3",
              url: "example.com/chapter-3",
              imageLinks: ["img1", "img2", "img3"],
            },
          ],
        },
      ])(
        "should correctly download selection of chapters",
        async ({ title, expected }) => {
          const numTotalImages = expected.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          mockPreparationService.start.mockResolvedValue({
            title,
            chapters: expected,
          });

          await comicrawl.run();

          expect(mockProgressManager.createComicBar).toHaveBeenCalledWith(
            title,
            expected.length
          );
          expect(mockProgressManager.advanceComic).toHaveBeenCalledTimes(
            expected.length
          );
          expect(mkdirSpy).toHaveBeenCalledTimes(expected.length);
          expected.forEach((chapter, index) => {
            expect(
              mockProgressManager.createChapterBar
            ).toHaveBeenNthCalledWith(
              index + 1,
              chapter.title,
              chapter.imageLinks.length
            );
          });
          expect(mockProgressManager.advanceChapter).toHaveBeenCalledTimes(
            numTotalImages
          );
          expect(imageSpy).toHaveBeenCalledTimes(numTotalImages);
          expect(mockProgressManager.completeChapter).toHaveBeenCalled();
          expect(mockProgressManager.completeComic).toHaveBeenCalled();
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
        }
      );
    });

    describe("download chapters in range", () => {
      it.each([
        {
          title: "Comic 1",
          startingPoint: 2,
          endPoint: 3,
          expected: [
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
        {
          title: "Comic 2",
          startingPoint: 3,
          endPoint: 4,
          expected: [
            {
              title: "Chapter 3",
              url: "example.com/chapter-3",
              imageLinks: ["img1", "img2", "img3"],
            },
            {
              title: "Chapter 4",
              url: "example.com/chapter-4",
              imageLinks: ["img1", "img2", "img3", "img4", "img5"],
            },
          ],
        },
      ])(
        "should download all chapters from $startingPoint to $endPoint",
        async ({ title, expected }) => {
          const numTotalImages = expected.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          mockPreparationService.start.mockResolvedValue({
            title,
            chapters: expected,
          });

          await comicrawl.run();

          expect(mockProgressManager.createComicBar).toHaveBeenCalledWith(
            title,
            expected.length
          );
          expect(mockProgressManager.advanceComic).toHaveBeenCalledTimes(
            expected.length
          );
          expect(mkdirSpy).toHaveBeenCalledTimes(expected.length);
          expected.forEach((chapter, index) => {
            expect(
              mockProgressManager.createChapterBar
            ).toHaveBeenNthCalledWith(
              index + 1,
              chapter.title,
              chapter.imageLinks.length
            );
          });
          expect(mockProgressManager.advanceChapter).toHaveBeenCalledTimes(
            numTotalImages
          );
          expect(imageSpy).toHaveBeenCalledTimes(numTotalImages);
          expect(mockProgressManager.completeChapter).toHaveBeenCalled();
          expect(mockProgressManager.completeComic).toHaveBeenCalled();
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(1);
        }
      );
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
