import LogFileCreationFailed from "../src/core/error/errors/LogFileCreationFailed";
import LogFileMissing from "../src/core/error/errors/LogFileMissing";
import LogFile from "../src/core/io/LogFile";
import Logger from "../src/core/io/Logger";
import fs from "fs/promises";
import path from "path";
import { SourceOfTermination } from "../src/types";
import LogFileCorrupted from "../src/core/error/errors/LogFileCorrupted";

jest.mock("fs/promises");
jest.mock("path");

describe("LogFile", () => {
  let mockLogger: jest.Mocked<Logger>;
  let mockJoin = path.join as jest.Mock;
  let mockMkdir = fs.mkdir as jest.Mock;
  let mockWriteFile = fs.writeFile as jest.Mock;
  let mockReadFile = fs.readFile as jest.Mock;
  let mockStringify = jest.spyOn(JSON, "stringify").mockReturnValue("test");
  let mockParse = jest.spyOn(JSON, "parse").mockReturnValue("test");

  beforeEach(() => {
    mockLogger = {
      logSessionOutcome: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create new log file", async () => {
      mockReadFile.mockImplementationOnce(async () => {
        throw new Error();
      });
      for (let i = 0; i < 4; i++) {
        mockJoin.mockReturnValueOnce("/test/logs");
      }
      mockJoin.mockReturnValueOnce("/test/logs/log.json");
      jest.spyOn(Date, "now").mockReturnValue(12345);
      const logFile = new LogFile(mockLogger);

      await logFile.init();

      expect(mockMkdir).toHaveBeenCalledWith("/test/logs", { recursive: true });
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/test/logs/log.json",
        "test",
        { encoding: "utf-8" }
      );
      expect(mockStringify).toHaveBeenCalledWith({
        createdAt: new Date(12345),
        failedDownloads: {},
        sourceOfTermination: "Program",
      });
    });

    it("should perform no action if log file already exists", async () => {
      const logFile = new LogFile(mockLogger);

      await logFile.init();

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should throw 'LogFileCreationFailed' if log file can't be created", async () => {
      mockReadFile.mockImplementationOnce(async () => {
        throw new Error();
      });
      mockMkdir.mockImplementation(async () => {
        throw new Error();
      });
      const logFile = new LogFile(mockLogger);

      await expect(logFile.init()).rejects.toThrow(LogFileCreationFailed);
    });
  });

  describe("registerFailedDownload", () => {
    it.each([
      {
        initial: [
          {
            chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
            image: { index: 20, url: "example.com/chapter-1/20" },
          },
        ],
      },
      {
        initial: [
          {
            chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
            image: { index: 20, url: "example.com/chapter-1/20" },
          },
          {
            chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
            image: { index: 24, url: "example.com/chapter-1/24" },
          },
        ],
      },
    ])("should register failed download correctly", ({ initial }) => {
      const failedDownload = {
        chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
        image: { index: 100, url: "example.com/chapter-1/100" },
      };
      const logFile = new LogFile(mockLogger, [...initial]);

      logFile.registerFailedDownload(failedDownload);

      expect(logFile.failedDownloads).toStrictEqual([
        ...initial,
        failedDownload,
      ]);
    });
  });

  describe("registerSessionInfo", () => {
    it.each([{ title: "Comic 1", url: "https://example.com/comic-1" }])(
      "should add title: '$title' and url: '$url' to log file",
      async ({ title, url }) => {
        mockJoin.mockReturnValue("/test/log.json");
        jest.spyOn(Date, "now").mockReturnValue(12345);
        mockReadFile.mockResolvedValue("");
        mockParse.mockResolvedValue({
          comic: { title: undefined, url: undefined },
          createdAt: new Date(12345),
          failedDownloads: [],
          sourceOfTermination: "Program",
        });

        const logFile = new LogFile(mockLogger);

        await logFile.registerSessionInfo({ title, url });

        expect(mockStringify).toHaveBeenCalledWith({
          comic: { title, url },
          createdAt: new Date(12345),
          failedDownloads: [],
          sourceOfTermination: "Program",
        });
        expect(mockWriteFile).toHaveBeenCalledWith("/test/log.json", "test", {
          encoding: "utf-8",
        });
      }
    );

    it("should throw 'LogFileMissing' if log file does not exist", async () => {
      mockReadFile.mockImplementation(() => {
        throw new Error();
      });
      const logFile = new LogFile(mockLogger);

      await expect(
        logFile.registerSessionInfo({
          title: "Comic 1",
          url: "example.com/comic-1",
        })
      ).rejects.toThrow(LogFileMissing);
    });
  });

  describe("dump", () => {
    it.each([
      {
        title: "Comic 1",
        url: "example.com/comic-1",
        failedDownloads: [],
        sourceOfTermination: "User",
        grouped: {},
      },
      {
        title: "Comic 1",
        url: "example.com/comic-1",
        failedDownloads: [
          {
            chapter: { title: "Chapter 1", url: "/chapter1" },
            image: { index: 1, url: "/img1" },
          },
        ],
        sourceOfTermination: "Error",
        grouped: {
          "Chapter 1": [{ index: 1, url: "/img1" }],
        },
      },
      {
        title: "Comic 1",
        url: "example.com/comic-1",
        failedDownloads: [
          {
            chapter: { title: "Chapter 1", url: "/chapter1" },
            image: { index: 1, url: "/img1" },
          },
          {
            chapter: { title: "Chapter 1", url: "/chapter1" },
            image: { index: 10, url: "/img10" },
          },
          {
            chapter: { title: "Chapter 2", url: "/chapter2" },
            image: { index: 1, url: "/img1" },
          },
        ],
        sourceOfTermination: "Program",
        grouped: {
          "Chapter 1": [
            { index: 1, url: "/img1" },
            { index: 10, url: "/img10" },
          ],
          "Chapter 2": [{ index: 1, url: "/img1" }],
        },
      },
    ])(
      "should dump finalized version of log file",
      async ({ title, url, failedDownloads, sourceOfTermination, grouped }) => {
        mockJoin.mockReturnValue("/test/log.json");
        jest.spyOn(Date, "now").mockReturnValue(12345);
        mockReadFile.mockResolvedValue("");
        mockParse.mockResolvedValue({
          comic: { title, url },
          createdAt: new Date(12345),
          failedDownloads,
          sourceOfTermination: "Program",
        });
        const logFile = new LogFile(mockLogger, failedDownloads);

        await logFile.dump(sourceOfTermination as SourceOfTermination);

        expect(mockLogger.logSessionOutcome).toHaveBeenCalledWith(
          sourceOfTermination,
          failedDownloads.length
        );
        expect(mockWriteFile).toHaveBeenCalledWith("/test/log.json", "test", {
          encoding: "utf-8",
        });
        expect(mockStringify).toHaveBeenCalledWith({
          comic: { title, url },
          createdAt: new Date(12345),
          failedDownloads: grouped,
          sourceOfTermination,
        });
      }
    );

    it("should throw 'LogFileMissing' if log file does not exist", async () => {
      mockReadFile.mockImplementation(() => {
        throw new Error();
      });
      const logFile = new LogFile(mockLogger);

      await expect(logFile.dump("User")).rejects.toThrow(LogFileMissing);
    });
  });

  describe("read", () => {
    const content = {
      comic: {
        title: "Comic 1",
        url: "https://example.com/comic-1",
      },
      createdAt: "123",
      failedDownloads: {},
      sourceOfTermination: "Program",
    };

    it("should correctly read log file content", async () => {
      mockReadFile.mockResolvedValueOnce("");
      mockParse.mockResolvedValueOnce(content);

      const logFile = new LogFile(mockLogger);

      const result = await logFile.read();

      expect(result).toStrictEqual(content);
    });

    it("should throw 'LogFileCorrupted' error if log file is corrupt", async () => {
      mockReadFile.mockImplementationOnce(() => {
        throw new Error();
      });

      const logFile = new LogFile(mockLogger);

      await expect(logFile.read).rejects.toThrow(LogFileCorrupted);
    });
  });

  describe("isValid", () => {
    it.each([
      {
        comic: {
          title: "",
          url: "",
        },
        createdAt: new Date(123),
        failedDownloads: {},
        sourceOfTermination: "User",
      },
    ])("should return true for valid log file", (content) => {
      const logFile = new LogFile(mockLogger);

      const result = logFile.isValid(content);

      expect(result).toBe(true);
    });

    it.each([
      {},
      {
        comic: {},
      },
      {
        comic: {
          title: "Comic 1",
          url: 123,
        },
      },
      {
        comic: {
          title: "Comic 1",
          url: "https://example.com/comic-1",
        },
        createdAt: new Date(123),
        failedDownloads: {},
      },
    ])("should return false for invalid log file", (content) => {
      const logFile = new LogFile(mockLogger);

      const result = logFile.isValid(content);

      expect(result).toBe(false);
    });
  });
});
