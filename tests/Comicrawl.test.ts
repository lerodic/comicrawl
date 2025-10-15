import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import Logger from "../src/core/io/Logger";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import CrawlerInitializationFailed from "../src/core/errors/CrawlerInitializationFailed";
import fs from "fs/promises";
import download from "image-downloader";

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
  let mkdirSpy = jest.spyOn(fs, "mkdir").mockImplementation();
  let exitSpy = jest.spyOn(process, "exit").mockImplementation();
  let imageSpy = jest.spyOn(download, "image").mockImplementation();

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
      error: jest.fn(),
      logChaptersFound: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockProgressManager = {
      createPreparationBar: jest.fn(),
      advancePreparation: jest.fn(),
      completePreparation: jest.fn(),
      createComicBar: jest.fn(),
      advanceComic: jest.fn(),
      completeComic: jest.fn(),
      createChapterBar: jest.fn(),
      advanceChapter: jest.fn(),
      completeChapter: jest.fn(),
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
    describe("download whole comic", () => {
      it.each([
        {
          url: "example.com/comic-1",
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
        async ({ title, url, chapters }) => {
          const numTotalImages = chapters.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          const chaptersWithoutLinks = chapters.map((chapter) => ({
            title: chapter.title,
            url: chapter.url,
          }));
          mockPrompt.getUrl.mockResolvedValue(url);
          mockCrawler.extractTitle.mockResolvedValue(title);
          mockCrawler.extractChapters.mockResolvedValue(chaptersWithoutLinks);
          mockPrompt.getDownloadOption.mockResolvedValue("All");
          for (let i = 0; i < chapters.length; i++) {
            mockCrawler.extractImageLinks.mockResolvedValueOnce(
              chapters[i].imageLinks
            );
          }

          await comicrawl.run();

          expect(mockLogger.logChaptersFound).toHaveBeenCalledWith(
            title,
            chapters.length
          );
          expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
            title,
            chapters.length
          );
          chapters.forEach((chapter, index) => {
            expect(mockCrawler.extractImageLinks).toHaveBeenNthCalledWith(
              index + 1,
              chapter.url
            );
          });
          expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
            chapters.length
          );
          expect(mockProgressManager.completePreparation).toHaveBeenCalled();
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
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(2);
        }
      );
    });

    describe("download chunk of comic", () => {
      it.each([
        {
          url: "example.com/comic-1",
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
          url: "example.com/comic-2",
          title: "Comic 2",
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
          url: "example.com/comic-3",
          title: "Comic 3",
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
        async ({ title, url, chapters, startingAt, expected }) => {
          const numTotalImages = expected.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          const chaptersWithoutLinks = chapters.map((chapter) => ({
            title: chapter.title,
            url: chapter.url,
          }));
          mockPrompt.getUrl.mockResolvedValue(url);
          mockCrawler.extractTitle.mockResolvedValue(title);
          mockCrawler.extractChapters.mockResolvedValue(chaptersWithoutLinks);
          mockPrompt.getDownloadOption.mockResolvedValue("Partial");
          mockPrompt.getChaptersStartingAt.mockResolvedValue(startingAt);
          for (let i = 0; i < expected.length; i++) {
            mockCrawler.extractImageLinks.mockResolvedValueOnce(
              expected[i].imageLinks
            );
          }

          await comicrawl.run();

          expect(mockLogger.logChaptersFound).toHaveBeenCalledWith(
            title,
            chapters.length
          );
          expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
            title,
            expected.length
          );
          expected.forEach((chapter, index) => {
            expect(mockCrawler.extractImageLinks).toHaveBeenNthCalledWith(
              index + 1,
              chapter.url
            );
          });
          expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
            expected.length
          );
          expect(mockProgressManager.completePreparation).toHaveBeenCalled();
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
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(2);
        }
      );
    });

    describe("download chapters by selection", () => {
      it.each([
        {
          url: "example.com/comic-1",
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
          url: "example.com/comic-2",
          title: "Comic 2",
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
          url: "example.com/comic-3",
          title: "Comic 3",
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
        async ({ url, title, chapters, selected, expected }) => {
          const numTotalImages = expected.reduce(
            (total, chapter) => total + chapter.imageLinks.length,
            0
          );
          const chaptersWithoutLinks = chapters.map((chapter) => ({
            title: chapter.title,
            url: chapter.url,
          }));
          mockPrompt.getUrl.mockResolvedValue(url);
          mockCrawler.extractTitle.mockResolvedValue(title);
          mockCrawler.extractChapters.mockResolvedValue(chaptersWithoutLinks);
          mockPrompt.getDownloadOption.mockResolvedValue("Selective");
          mockPrompt.getChaptersFromList.mockResolvedValue(selected);
          for (let i = 0; i < expected.length; i++) {
            mockCrawler.extractImageLinks.mockResolvedValueOnce(
              expected[i].imageLinks
            );
          }

          await comicrawl.run();

          expect(mockLogger.logChaptersFound).toHaveBeenCalledWith(
            title,
            chapters.length
          );
          expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
            title,
            expected.length
          );
          expected.forEach((chapter, index) => {
            expect(mockCrawler.extractImageLinks).toHaveBeenNthCalledWith(
              index + 1,
              chapter.url
            );
          });
          expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
            expected.length
          );
          expect(mockProgressManager.completePreparation).toHaveBeenCalled();
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
          expect(mockCrawler.terminate).toHaveBeenCalledTimes(2);
        }
      );
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
