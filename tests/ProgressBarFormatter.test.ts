import ProgressBarFormatter from "../src/core/io/progress/ProgressBarFormatter";
import chalk from "chalk";

describe("ProgressBarFormatter", () => {
  beforeEach(() => {
    chalk.level = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("format", () => {
    it.each([
      {
        width: 30,
        color: chalk.greenBright,
        progress: {
          title: "First bar",
          itemsCompleted: 0,
          itemsTotal: 20,
        },
        expected: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | First bar (0/20)",
      },
      {
        width: 20,
        color: chalk.greenBright,
        progress: {
          title: "Second bar",
          itemsCompleted: 10,
          itemsTotal: 30,
        },
        expected: "███████░░░░░░░░░░░░░ 33% | Second bar (10/30)",
      },
      {
        width: 30,
        color: chalk.blue,
        progress: {
          title: "Third bar",
          itemsCompleted: 28,
          itemsTotal: 40,
        },
        expected: "█████████████████████░░░░░░░░░ 70% | Third bar (28/40)",
      },
      {
        width: 30,
        color: chalk.blue,
        progress: {
          title:
            "This is a super long and random title to demonstrate truncation capabilities",
          itemsCompleted: 28,
          itemsTotal: 40,
        },
        expected:
          "█████████████████████░░░░░░░░░ 70% | This is a super long and ra... (28/40)",
      },
    ])("should return $expected", ({ width, color, progress, expected }) => {
      const generateLabel = (_: any) => progress.title;
      const formatter = new ProgressBarFormatter(width, color, generateLabel);

      const result = formatter.format(progress);

      expect(result).toStrictEqual(expected);
    });
  });
});
