import LogFileCorrupted from "../src/core/error/errors/LogFileCorrupted";
import ModeFactory from "../src/core/factories/ModeFactory";
import LogFile from "../src/core/io/LogFile";
import Prompt from "../src/core/io/Prompt";
import { DefiniteLogFileContent, Mode, ModeFactoryFn } from "../src/types";
import {
  logFileWithErrors,
  noErrorsLogFileContent,
} from "./fixtures/ModeFactory.fixtures";

describe("ModeFactory", () => {
  let modeFactory: ModeFactory;
  let mockModeFactoryFn: jest.Mocked<ModeFactoryFn>;
  let mockMode: jest.Mocked<Mode>;
  let mockLogFile: jest.Mocked<LogFile>;
  let mockPrompt: jest.Mocked<Prompt>;

  beforeEach(() => {
    mockMode = {} as unknown as jest.Mocked<Mode>;
    mockModeFactoryFn = jest.fn().mockResolvedValue(mockMode);
    mockLogFile = {
      read: jest.fn(),
      isValid: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;
    mockPrompt = {
      shouldRetryFailedDownloads: jest.fn(),
    } as unknown as jest.Mocked<Prompt>;

    modeFactory = new ModeFactory(mockModeFactoryFn, mockLogFile, mockPrompt);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getMode", () => {
    it.each(noErrorsLogFileContent)(
      "should return an instance of 'DefaultMode' if no failed downloads have been registered",
      async (logFileContent: DefiniteLogFileContent) => {
        mockLogFile.read.mockResolvedValueOnce(logFileContent);
        mockLogFile.isValid.mockReturnValueOnce(true);

        await modeFactory.getMode();

        expect(mockModeFactoryFn).toHaveBeenCalledWith(false);
      }
    );

    it.each(logFileWithErrors)(
      "should return an instance of 'FailedDownloadsMode' if failed downloads have been tracked and user confirms retry",
      async (logFileContent: DefiniteLogFileContent) => {
        mockLogFile.read.mockResolvedValueOnce(logFileContent);
        mockLogFile.isValid.mockReturnValueOnce(true);
        mockPrompt.shouldRetryFailedDownloads.mockResolvedValue(true);

        await modeFactory.getMode();

        expect(mockModeFactoryFn).toHaveBeenCalledWith(true);
      }
    );

    it.each(logFileWithErrors)(
      "should return an instance of 'DefaultMode' if failed downloads have been tracked but user declines retry",
      async (logFileContent: DefiniteLogFileContent) => {
        mockLogFile.read.mockResolvedValueOnce(logFileContent);
        mockLogFile.isValid.mockReturnValueOnce(true);
        mockPrompt.shouldRetryFailedDownloads.mockResolvedValue(false);

        await modeFactory.getMode();

        expect(mockModeFactoryFn).toHaveBeenCalledWith(false);
      }
    );

    it("should throw 'LogFileCorrupted' error if log file is corrupt", async () => {
      mockLogFile.read.mockResolvedValueOnce({
        comic: {
          title: undefined,
          url: "https://example.com/comic-1",
        },
      } as any);
      mockLogFile.isValid.mockReturnValueOnce(false);

      await expect(modeFactory.getMode()).rejects.toThrow(LogFileCorrupted);
    });
  });
});
