import "reflect-metadata";
import ProgressManager from "../src/core/io/ProgressManager";
import chalk from "chalk";

describe("ProgressManager", () => {
  beforeEach(() => {
    chalk.level = 0;
    jest.spyOn(process.stdout, "write").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createChapterPreparationBar", () => {
    it.each([
      {
        title: "Comic 1",
        itemsTotal: 12,
      },
      {
        title: "Random graphic novel",
        itemsTotal: 89,
      },
    ])(
      "should create new chapter preparation bar for '$title' ($itemsTotal chapters)",
      ({ title, itemsTotal }) => {
        const progress = new ProgressManager();
        const logSpy = jest.spyOn(console, "log");

        progress.createChapterPreparationBar(title, itemsTotal);

        expect(logSpy).toHaveBeenCalledWith(
          `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Preparing chapters (0/${itemsTotal})`
        );
      }
    );
  });

  describe("advanceChapterPreparation", () => {
    it.each([
      {
        title: "Comic 1",
        itemsCompleted: 3,
        expected: 4,
        itemsTotal: 12,
        output: `██████████░░░░░░░░░░░░░░░░░░░░ 33% | Preparing chapters (4/12)`,
      },
      {
        title: "Random graphic novel",
        itemsCompleted: 44,
        expected: 45,
        itemsTotal: 90,
        output: `███████████████░░░░░░░░░░░░░░░ 50% | Preparing chapters (45/90)`,
      },
    ])(
      "should increment progress for '$title' from $itemsCompleted => $expected",
      ({ title, itemsCompleted, itemsTotal, output }) => {
        const progress = new ProgressManager({
          title,
          itemsCompleted,
          itemsTotal,
        });
        const logSpy = jest.spyOn(console, "log");

        progress.advanceChapterPreparation();

        expect(logSpy).toHaveBeenCalledWith(output);
      }
    );
  });

  describe("completeChapterPreparation", () => {
    it.each([
      {
        title: "Comic 1",
        itemsCompleted: 11,
        itemsTotal: 12,
      },
      {
        title: "Comic 1",
        itemsCompleted: 3,
        itemsTotal: 12,
      },
      {
        title: "Manga 1",
        itemsCompleted: 192,
        itemsTotal: 193,
      },
    ])(
      "should complete chapter preparation for '$title' ($itemsTotal chapters)",
      ({ title, itemsCompleted, itemsTotal }) => {
        const progress = new ProgressManager({
          title,
          itemsCompleted,
          itemsTotal,
        });
        const logSpy = jest.spyOn(console, "log");

        progress.completeChapterPreparation();

        expect(logSpy).toHaveBeenCalledWith(
          `██████████████████████████████ 100% | Preparing chapters (${itemsTotal}/${itemsTotal})`
        );
      }
    );
  });
});
