import DownloadService from "../src/core/download/DownloadService";
import PreparationService from "../src/core/download/PreparationService";
import LogFile from "../src/core/io/LogFile";
import DefaultMode from "../src/core/modes/DefaultMode";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("DefaultMode", () => {
  let defaultMode: DefaultMode;
  let mockLogFile: jest.Mocked<LogFile>;
  let mockPreparationService: jest.Mocked<PreparationService>;
  let mockDownloadService: jest.Mocked<DownloadService>;

  beforeEach(() => {
    mockLogFile = {
      registerSessionInfo: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;
    mockPreparationService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<PreparationService>;
    mockDownloadService = {
      start: jest.fn(),
    } as unknown as jest.Mocked<DownloadService>;

    defaultMode = new DefaultMode(
      mockLogFile,
      mockPreparationService,
      mockDownloadService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it("should execute correctly", async () => {
      const downloadInfo = {
        url: "https://example.com/comic-1",
        title: "Comic 1",
        chapters: [],
      };
      mockPreparationService.start.mockResolvedValueOnce(downloadInfo);

      await defaultMode.run();

      expect(mockLogFile.registerSessionInfo).toHaveBeenCalledWith({
        url: downloadInfo.url,
        title: downloadInfo.title,
      });
      expect(mockDownloadService.start).toHaveBeenCalledWith(
        downloadInfo.title,
        downloadInfo.chapters
      );
    });
  });
});
