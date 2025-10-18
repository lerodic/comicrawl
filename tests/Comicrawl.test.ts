import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import { EventEmitter } from "../src/types";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";
import PreparationService from "../src/core/download/PreparationService";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
import DownloadService from "../src/core/download/DownloadService";
import ErrorHandler from "../src/core/error/ErrorHandler";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockPreparationService: jest.Mocked<PreparationService>;
  let mockDownloadService: jest.Mocked<DownloadService>;
  let mockErrorHandler: jest.Mocked<ErrorHandler>;
  let mockEventEmitter: jest.Mocked<EventEmitter>;

  beforeEach(() => {
    mockPreparationService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<PreparationService>;

    mockDownloadService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<DownloadService>;

    mockErrorHandler = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<ErrorHandler>;

    mockEventEmitter = {
      on: jest.fn(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter>;

    comicrawl = new Comicrawl(
      mockPreparationService,
      mockDownloadService,
      mockErrorHandler,
      mockEventEmitter
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
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
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "applicationTerminated"
      );
    });

    it("should exit early if graphic novel does not contain any chapters", async () => {
      const error = new EmptyGraphicNovel("Chapterless comic");
      mockPreparationService.start.mockImplementation(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "applicationTerminated"
      );
    });

    it("should exit early if crawler initialization fails", async () => {
      const error = new CrawlerInitializationFailed();
      mockPreparationService.start.mockImplementationOnce(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "applicationTerminated"
      );
    });

    it("should terminate correctly on unexpected error", async () => {
      const error = new Error();
      mockPreparationService.start.mockImplementationOnce(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "applicationTerminated"
      );
    });
  });
});
