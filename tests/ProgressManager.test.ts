import "reflect-metadata";
import ProgressManager from "../src/core/io/ProgressManager";
import chalk from "chalk";
import ProgressBar from "../src/core/io/ProgressBar";

describe("ProgressManager", () => {
  let progressManager: ProgressManager;
  let mockPreparationProgressBar: jest.Mocked<ProgressBar>;

  beforeEach(() => {
    chalk.level = 0;
    jest.spyOn(process.stdout, "write").mockImplementation(jest.fn());

    mockPreparationProgressBar = {
      init: jest.fn(),
      advance: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<ProgressBar>;

    progressManager = new ProgressManager(mockPreparationProgressBar);
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
});
