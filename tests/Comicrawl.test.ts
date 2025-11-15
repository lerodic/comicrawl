import "reflect-metadata";
import Comicrawl from "../src/core/Comicrawl";
import ErrorHandler from "../src/core/error/ErrorHandler";
import LogFile from "../src/core/io/LogFile";
import ModeFactory from "../src/core/factories/ModeFactory";
import { Mode } from "../src/types";
import CrawlerInitializationFailed from "../src/core/error/errors/CrawlerInitializationFailed";

jest.mock("p-limit", () => {
  return () => {
    return (fn: (...args: any[]) => any) => fn();
  };
});

describe("Comicrawl", () => {
  let comicrawl: Comicrawl;
  let mockMode: jest.Mocked<Mode>;
  let mockModeFactory: jest.Mocked<ModeFactory>;
  let mockErrorHandler: jest.Mocked<ErrorHandler>;
  let mockLogFile: jest.Mocked<LogFile>;

  beforeEach(() => {
    mockMode = {
      run: jest.fn(),
    } as unknown as jest.Mocked<Mode>;

    mockModeFactory = {
      getMode: jest.fn().mockResolvedValue(mockMode),
    } as unknown as jest.Mocked<ModeFactory>;

    mockErrorHandler = {
      handle: jest.fn(),
      shouldErrorBeIgnored: jest.fn(),
    } as unknown as jest.Mocked<ErrorHandler>;

    mockLogFile = {
      init: jest.fn(),
      dump: jest.fn(),
    } as unknown as jest.Mocked<LogFile>;

    comicrawl = new Comicrawl(mockModeFactory, mockErrorHandler, mockLogFile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it("should execute correctly", async () => {
      await comicrawl.run();

      expect(mockMode.run).toHaveBeenCalled();
      expect(mockLogFile.init).toHaveBeenCalled();
      expect(mockLogFile.dump).toHaveBeenCalledWith("Program");
    });

    it("should terminate correctly on unexpected error", async () => {
      const error = new Error();
      mockMode.run.mockImplementationOnce(() => {
        throw error;
      });
      mockErrorHandler.shouldErrorBeIgnored.mockReturnValueOnce(false);

      await comicrawl.run();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockLogFile.dump).toHaveBeenCalledWith("Error");
    });

    it("should terminate correctly on error that can be safely ignored", async () => {
      const error = new CrawlerInitializationFailed();
      mockMode.run.mockImplementationOnce(() => {
        throw error;
      });
      mockErrorHandler.shouldErrorBeIgnored.mockReturnValueOnce(true);

      await comicrawl.run();

      expect(mockErrorHandler.handle).not.toHaveBeenCalled();
      expect(mockLogFile.dump).toHaveBeenCalledWith("User");
    });

    it("should correctly listen for SIGINT event and act accordingly", async () => {
      mockMode.run.mockImplementation((): any => {
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
