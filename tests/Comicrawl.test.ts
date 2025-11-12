import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";
import PreparationService from "../src/core/download/PreparationService";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
import DownloadService from "../src/core/download/DownloadService";
import ErrorHandler from "../src/core/error/ErrorHandler";
import LogFile from "../src/core/io/LogFile";

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
  let mockLogFile: jest.Mocked<LogFile>;

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

    mockLogFile = {
      create: jest.fn(),
      registerSessionInfo: jest.fn(),
      dump: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;

    comicrawl = new Comicrawl(
      mockPreparationService,
      mockDownloadService,
      mockErrorHandler,
      mockLogFile
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it.each([
      {
        title: "Comic 1",
        url: "example.com/comic-1",
        chapters: [
          {
            title: "Chapter 1",
            url: "example.com/comic-1/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            title: "Chapter 2",
            url: "example.com/comic-1/chapter-2",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
          {
            title: "Chapter 3",
            url: "example.com/comic-1/chapter-3",
            imageLinks: ["img1", "img2", "img3"],
          },
        ],
      },
    ])("should execute correctly", async ({ url, title, chapters }) => {
      mockPreparationService.start.mockResolvedValue({ url, title, chapters });

      await comicrawl.run();

      expect(mockLogFile.create).toHaveBeenCalled();
      expect(mockLogFile.registerSessionInfo).toHaveBeenCalledWith({
        url,
        title,
      });
      expect(mockDownloadService.start).toHaveBeenCalledWith(title, chapters);
      expect(mockLogFile.dump).toHaveBeenCalledWith("Program");
    });

    it("should exit early if graphic novel does not contain any chapters", async () => {
      const error = new EmptyGraphicNovel("Chapterless comic");
      mockPreparationService.start.mockImplementation(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockLogFile.dump).toHaveBeenCalledWith("Error");
    });

    it("should exit early if crawler initialization fails", async () => {
      const error = new CrawlerInitializationFailed();
      mockPreparationService.start.mockImplementationOnce(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockLogFile.dump).toHaveBeenCalledWith("Error");
    });

    it("should terminate correctly on unexpected error", async () => {
      const error = new Error();
      mockPreparationService.start.mockImplementationOnce(() => {
        throw error;
      });

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockLogFile.dump).toHaveBeenCalledWith("Error");
    });

    it("should correctly listen for SIGINT event and act accordingly", async () => {
      mockPreparationService.start.mockImplementation((): any => {
        process.emit("SIGINT");
      });

      await comicrawl.run();

      expect(mockLogFile.dump).toHaveBeenCalledWith("User");
    });

    it("should only ever perform shutdown once, no matter how often the shutdown process is initiated", async () => {
      await (comicrawl as any).init();

      await (comicrawl as any).shutdown("User");
      await (comicrawl as any).shutdown("User");

      expect(mockLogFile.dump).toHaveBeenCalledTimes(1);
    });
  });
});
