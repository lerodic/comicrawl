import DownloadService from "../src/core/download/DownloadService";
import fs from "fs/promises";
import path from "path";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import { limit } from "../src/utils/performance";
import download from "image-downloader";
import LogFile from "../src/core/io/LogFile";
import dns from "dns/promises";
import ConnectionInterrupted from "../src/core/error/errors/ConnectionInterrupted";

jest.mock("dns/promises");
jest.mock("fs/promises");
jest.mock("image-downloader");
jest.mock("../src/utils/performance", () => ({
  limit: jest.fn(),
}));

describe("DownloadService", () => {
  let downloadService: DownloadService;
  let mockProgressManager: jest.Mocked<ProgressManager>;
  let mockLogFile: jest.Mocked<LogFile>;
  let mkdirSpy = jest.spyOn(fs, "mkdir");
  let joinSpy = jest.spyOn(path, "join");
  let imageSpy = jest.spyOn(download, "image");
  let lookupSpy = jest.spyOn(dns, "lookup");

  beforeEach(() => {
    (limit as jest.Mock).mockImplementation(async (tasks: any[]) => {
      return Promise.all(tasks.map((t) => t()));
    });

    mockProgressManager = {
      createComicBar: jest.fn(),
      advanceComic: jest.fn(),
      completeComic: jest.fn(),
      createChapterBar: jest.fn(),
      advanceChapter: jest.fn(),
      completeChapter: jest.fn(),
    } as unknown as jest.Mocked<ProgressManager>;

    mockLogFile = {
      registerFailedDownload: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;

    downloadService = new DownloadService(mockProgressManager, mockLogFile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("start", () => {
    it.each([
      {
        comicTitle: "Comic 1",
        imageCount: 10,
        chapters: [
          {
            url: "/chapter-1",
            title: "Chapter 1",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
            ],
          },
          {
            url: "/chapter-2",
            title: "Chapter 2",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
              {
                url: "img4",
                index: 3,
              },
            ],
          },
          {
            url: "/chapter-3",
            title: "Chapter 3",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
            ],
          },
        ],
      },
      {
        comicTitle: "Comic 2",
        imageCount: 17,
        chapters: [
          {
            url: "/chapter-1",
            title: "Chapter 1",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
              {
                url: "img4",
                index: 3,
              },
              {
                url: "img5",
                index: 4,
              },
            ],
          },
          {
            url: "/chapter-2",
            title: "Chapter 2",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
              {
                url: "img4",
                index: 3,
              },
            ],
          },
          {
            url: "/chapter-3",
            title: "Chapter 3",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
            ],
          },
          {
            url: "/chapter-4",
            title: "Chapter 4",
            images: [
              {
                url: "img1",
                index: 0,
              },
              {
                url: "img2",
                index: 1,
              },
              {
                url: "img3",
                index: 2,
              },
              {
                url: "img4",
                index: 3,
              },
              {
                url: "img5",
                index: 4,
              },
              {
                url: "img6",
                index: 5,
              },
            ],
          },
        ],
      },
    ])(
      "should download a total of $imageCount images and $chapters.length chapters for: '$comicTitle'",
      async ({ comicTitle, imageCount, chapters }) => {
        joinSpy.mockReturnValue("/test/path");

        await downloadService.start(comicTitle, chapters);

        expect(mockProgressManager.createComicBar).toHaveBeenCalledWith(
          comicTitle,
          chapters.length
        );
        chapters.forEach((chapter) => {
          expect(mkdirSpy).toHaveBeenCalledWith("/test/path", {
            recursive: true,
          });

          expect(mockProgressManager.createChapterBar).toHaveBeenCalledWith(
            chapter.title,
            chapter.images.length
          );
        });
        expect(imageSpy).toHaveBeenCalledTimes(imageCount);
        expect(mockProgressManager.advanceChapter).toHaveBeenCalledTimes(
          imageCount
        );
        expect(mockProgressManager.completeChapter).toHaveBeenCalledTimes(
          chapters.length
        );
        expect(mockProgressManager.advanceComic).toHaveBeenCalledTimes(
          chapters.length
        );
        expect(mockProgressManager.completeComic).toHaveBeenCalled();
      }
    );

    it("should delegate to LogFile on download-related error", async () => {
      const comicTitle = "Comic 1";
      const chapter = {
        title: "Chapter 1",
        url: "example.com/chapter-1",
        images: [{ url: "/img1", index: 0 }],
      };
      joinSpy.mockReturnValue("/test/path");
      imageSpy.mockImplementationOnce(async () => {
        throw new Error();
      });
      lookupSpy.mockResolvedValue({ address: "111.111.11.11", family: 4 });

      await downloadService.start(comicTitle, [chapter]);

      expect(mockLogFile.registerFailedDownload).toHaveBeenCalledWith({
        chapter,
        image: chapter.images[0],
      });
    });

    it("should throw 'ConnectionInterrupted' if network connection is dropped", async () => {
      const comicTitle = "Comic 1";
      const chapter = {
        title: "Chapter 1",
        url: "example.com/chapter-1",
        images: [{ url: "/img1", index: 0 }],
      };
      joinSpy.mockReturnValue("/test/path");
      imageSpy.mockImplementationOnce(() => {
        throw new Error();
      });
      lookupSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(
        downloadService.start(comicTitle, [chapter])
      ).rejects.toThrow(ConnectionInterrupted);
    });
  });
});
