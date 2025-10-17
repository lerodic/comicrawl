import DownloadService from "../src/core/download/DownloadService";
import fs from "fs/promises";
import path from "path";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import { limit } from "../src/utils/performance";
import download from "image-downloader";

jest.mock("fs/promises");
jest.mock("image-downloader");
jest.mock("../src/utils/performance", () => ({
  limit: jest.fn(),
}));

describe("DownloadService", () => {
  let downloadService: DownloadService;
  let mockProgressManager: jest.Mocked<ProgressManager>;
  let mkdirSpy = jest.spyOn(fs, "mkdir");
  let joinSpy = jest.spyOn(path, "join");
  let imageSpy = jest.spyOn(download, "image");

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

    downloadService = new DownloadService(mockProgressManager);
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
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            url: "/chapter-2",
            title: "Chapter 2",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
          {
            url: "/chapter-3",
            title: "Chapter 3",
            imageLinks: ["img1", "img2", "img3"],
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
            imageLinks: ["img1", "img2", "img3", "img4", "img5"],
          },
          {
            url: "/chapter-2",
            title: "Chapter 2",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
          {
            url: "/chapter-3",
            title: "Chapter 3",
            imageLinks: ["img1", "img2"],
          },
          {
            url: "/chapter-4",
            title: "Chapter 4",
            imageLinks: ["img1", "img2", "img3", "img4", "img5", "img6"],
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
            chapter.imageLinks.length
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
  });
});
