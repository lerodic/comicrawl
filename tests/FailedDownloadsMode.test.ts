import DownloadService from "../src/core/download/DownloadService";
import LogFileCorrupted from "../src/core/error/errors/LogFileCorrupted";
import LogFile from "../src/core/io/LogFile";
import FailedDownloadsMode from "../src/core/modes/FailedDownloadsMode";
import { DefiniteLogFileContent } from "../src/types";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("FailedDownloadsMode", () => {
  let failedDownloadsMode: FailedDownloadsMode;
  let mockLogFile: jest.Mocked<LogFile>;
  let mockDownloadService: jest.Mocked<DownloadService>;

  beforeEach(() => {
    mockLogFile = {
      read: jest.fn(),
      isValid: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;
    mockDownloadService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<DownloadService>;

    failedDownloadsMode = new FailedDownloadsMode(
      mockLogFile,
      mockDownloadService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it.each([
      {
        logFileContent: {
          comic: {
            title: "Comic 1",
            url: "https://example.com/comic-1",
          },
          createdAt: new Date(123),
          failedDownloads: {
            "Chapter 1": [
              {
                url: "https://example.com/comic-1/chapter-1/img2.png",
                index: 1,
              },
              {
                url: "https://example.com/comic-1/chapter-1/img3.png",
                index: 2,
              },
            ],
          },
          sourceOfTermination: "Program",
        },
        converted: [
          {
            title: "Chapter 1",
            url: "",
            images: [
              {
                url: "https://example.com/comic-1/chapter-1/img2.png",
                index: 1,
              },
              {
                url: "https://example.com/comic-1/chapter-1/img3.png",
                index: 2,
              },
            ],
          },
        ],
      },
      {
        logFileContent: {
          comic: {
            title: "Comic 2",
            url: "https://example.com/comic-2",
          },
          createdAt: new Date(123),
          failedDownloads: {
            "Chapter 1": [
              {
                url: "https://example.com/comic-2/chapter-1/img1.png",
                index: 0,
              },
              {
                url: "https://example.com/comic-2/chapter-1/img8.png",
                index: 7,
              },
            ],
            "Chapter 2": [
              {
                url: "https://example.com/comic-2/chapter-2/img19.png",
                index: 19,
              },
            ],
          },
          sourceOfTermination: "Program",
        },
        converted: [
          {
            title: "Chapter 1",
            url: "",
            images: [
              {
                url: "https://example.com/comic-2/chapter-1/img1.png",
                index: 0,
              },
              {
                url: "https://example.com/comic-2/chapter-1/img8.png",
                index: 7,
              },
            ],
          },
          {
            title: "Chapter 2",
            url: "",
            images: [
              {
                url: "https://example.com/comic-2/chapter-2/img19.png",
                index: 19,
              },
            ],
          },
        ],
      },
    ])("should execute correctly", async ({ logFileContent, converted }) => {
      mockLogFile.read.mockResolvedValueOnce(
        logFileContent as DefiniteLogFileContent
      );
      mockLogFile.isValid.mockReturnValueOnce(true);

      await failedDownloadsMode.run();

      expect(mockDownloadService.start).toHaveBeenCalledWith(
        logFileContent.comic.title,
        converted
      );
    });

    it("should throw 'LogFileCorrupted' if log file is corrupt", async () => {
      mockLogFile.read.mockResolvedValueOnce({} as any);
      mockLogFile.isValid.mockReturnValueOnce(false);

      await expect(failedDownloadsMode.run()).rejects.toThrow(LogFileCorrupted);
    });
  });
});
