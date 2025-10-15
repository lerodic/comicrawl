import "reflect-metadata";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import chalk from "chalk";
import ProgressBar from "../src/core/io/progress/ProgressBar";

describe("ProgressManager", () => {
  let progressManager: ProgressManager;
  let mockPreparationProgressBar: jest.Mocked<ProgressBar>;
  let mockComicProgressBar: jest.Mocked<ProgressBar>;
  let mockChapterProgressBar: jest.Mocked<ProgressBar>;

  beforeEach(() => {
    chalk.level = 0;
    jest.spyOn(process.stdout, "write").mockImplementation(jest.fn());

    mockPreparationProgressBar = {
      init: jest.fn(),
      advance: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<ProgressBar>;

    mockComicProgressBar = {
      init: jest.fn(),
      advance: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<ProgressBar>;

    mockChapterProgressBar = {
      init: jest.fn(),
      advance: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<ProgressBar>;

    progressManager = new ProgressManager(
      mockPreparationProgressBar,
      mockComicProgressBar,
      mockChapterProgressBar
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPreparationBar", () => {
    it.each([
      { title: "Bar 1", itemsTotal: 400 },
      { title: "Bar 2", itemsTotal: 20 },
    ])(
      "should create '$title' progress bar with $itemsTotal items",
      ({ title, itemsTotal }) => {
        progressManager.createPreparationBar(title, itemsTotal);

        expect(mockPreparationProgressBar.init).toHaveBeenCalledWith(
          title,
          itemsTotal,
          2
        );
      }
    );
  });

  describe("advancePreparationBar", () => {
    it("should advance preparation progress", () => {
      progressManager.advancePreparation();

      expect(mockPreparationProgressBar.advance).toHaveBeenCalled();
    });
  });

  describe("completePreparationBar", () => {
    it("should complete preparation", () => {
      progressManager.completePreparation();

      expect(mockPreparationProgressBar.complete).toHaveBeenCalled();
    });
  });

  describe("createComicBar", () => {
    it.each([
      { title: "Bar 1", itemsTotal: 400 },
      { title: "Bar 2", itemsTotal: 20 },
    ])(
      "should create '$title' progress bar with $itemsTotal items",
      ({ title, itemsTotal }) => {
        progressManager.createComicBar(title, itemsTotal);

        expect(mockComicProgressBar.init).toHaveBeenCalledWith(
          title,
          itemsTotal,
          1
        );
      }
    );
  });

  describe("advanceComic", () => {
    it("should advance comic progress", () => {
      progressManager.advanceComic();

      expect(mockComicProgressBar.advance).toHaveBeenCalled();
    });
  });

  describe("completeComic", () => {
    it("should complete comic", () => {
      progressManager.completeComic();

      expect(mockComicProgressBar.complete).toHaveBeenCalled();
    });
  });

  describe("createChapterBar", () => {
    it.each([
      { title: "Bar 1", itemsTotal: 400 },
      { title: "Bar 2", itemsTotal: 20 },
    ])(
      "should create '$title' progress bar with $itemsTotal items",
      ({ title, itemsTotal }) => {
        progressManager.createChapterBar(title, itemsTotal);

        expect(mockChapterProgressBar.init).toHaveBeenCalledWith(
          title,
          itemsTotal
        );
      }
    );
  });

  describe("advanceChapter", () => {
    it("should advance chapter progress", () => {
      progressManager.advanceChapter();

      expect(mockChapterProgressBar.advance).toHaveBeenCalled();
    });
  });

  describe("completeChapter", () => {
    it("should complete chapter", () => {
      progressManager.completeChapter();

      expect(mockChapterProgressBar.complete).toHaveBeenCalled();
    });
  });
});
