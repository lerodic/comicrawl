import ProgressBarFormatter from "../src/core/io/progress/ProgressBarFormatter";
import chalk from "chalk";
import { formatFixtures } from "./fixtures/ProgressBarFormatter.fixtures";

describe("ProgressBarFormatter", () => {
  beforeEach(() => {
    chalk.level = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("format", () => {
    it.each(formatFixtures)(
      "should return $expected",
      ({ width, color, progress, expected }) => {
        const generateLabel = (_: any) => progress.title;
        const formatter = new ProgressBarFormatter(width, color, generateLabel);

        const result = formatter.format(progress);

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
