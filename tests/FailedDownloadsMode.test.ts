import DownloadService from "../src/core/download/DownloadService";
import LogFileCorrupted from "../src/core/error/errors/LogFileCorrupted";
import LogFile from "../src/core/io/LogFile";
import FailedDownloadsMode from "../src/core/modes/FailedDownloadsMode";
import { DefiniteLogFileContent } from "../src/types";
import { runFixtures } from "./fixtures/FailedDownloadsMode.fixtures";

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
    it.each(runFixtures)(
      "should execute correctly",
      async ({ logFileContent, converted }) => {
        mockLogFile.read.mockResolvedValueOnce(
          logFileContent as DefiniteLogFileContent
        );
        mockLogFile.isValid.mockReturnValueOnce(true);

        await failedDownloadsMode.run();

        expect(mockDownloadService.start).toHaveBeenCalledWith(
          logFileContent.comic.title,
          converted
        );
      }
    );

    it("should throw 'LogFileCorrupted' if log file is corrupt", async () => {
      mockLogFile.read.mockResolvedValueOnce({} as any);
      mockLogFile.isValid.mockReturnValueOnce(false);

      await expect(failedDownloadsMode.run()).rejects.toThrow(LogFileCorrupted);
    });
  });
});
