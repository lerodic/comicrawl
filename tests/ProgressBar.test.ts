import "reflect-metadata";
import ProgressBar from "../src/core/io/progress/ProgressBar";
import chalk from "chalk";
import {
  advanceFixtures,
  completeFixtures,
  initFixtures,
} from "./fixtures/ProgressBar.fixtures";

describe("ProgressBar", () => {
  beforeEach(() => {
    chalk.level = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    describe("bars with lineDelta = 0", () => {
      describe("bars with preceding empty lines", () => {
        it.each(initFixtures.withoutLineDelta.withPrecedingEmptyLines)(
          "should init progress bar correctly",
          ({
            color,
            title,
            itemsTotal,
            numEmptyLines,
            emptyLines,
            formattedBar,
          }) => {
            const writeSpy = jest
              .spyOn(process.stdout, "write")
              .mockImplementation(jest.fn());
            const generateLabel = (_: any) => title;
            const progressBar = new ProgressBar(color, 0, generateLabel);

            progressBar.init(title, itemsTotal, numEmptyLines);

            expect((progressBar as any).progress).toStrictEqual({
              title,
              itemsTotal,
              itemsCompleted: 0,
            });
            expect(writeSpy).toHaveBeenNthCalledWith(1, emptyLines);
            expect(writeSpy).toHaveBeenNthCalledWith(2, "\x1b[2K\r");
            expect(writeSpy).toHaveBeenNthCalledWith(
              3,
              formattedBar + "\x1b[0K\r"
            );
          }
        );
      });

      describe("bars without preceding empty lines", () => {
        it.each(initFixtures.withoutLineDelta.withoutPrecedingEmptyLines)(
          "should init progress bar correctly",
          ({ color, title, itemsTotal, formattedBar }) => {
            const writeSpy = jest
              .spyOn(process.stdout, "write")
              .mockImplementation(jest.fn());
            const generateLabel = (_: any) => title;
            const progressBar = new ProgressBar(color, 0, generateLabel);

            progressBar.init(title, itemsTotal);

            expect((progressBar as any).progress).toStrictEqual({
              title,
              itemsTotal,
              itemsCompleted: 0,
            });
            expect(writeSpy).toHaveBeenCalledWith(formattedBar + "\x1b[0K\r");
          }
        );
      });
    });

    describe("bars with lineDelta > 0", () => {
      describe("bars with preceding empty lines", () => {
        it.each(initFixtures.withLineDelta.withPrecedingEmptyLines)(
          "should init progress bar correctly",
          ({
            color,
            title,
            lineDelta,
            itemsTotal,
            numEmptyLines,
            emptyLines,
            formattedBar,
          }) => {
            const writeSpy = jest
              .spyOn(process.stdout, "write")
              .mockImplementation(jest.fn());
            const generateLabel = (_: any) => title;
            const progressBar = new ProgressBar(
              color,
              lineDelta,
              generateLabel
            );

            progressBar.init(title, itemsTotal, numEmptyLines);

            expect((progressBar as any).progress).toStrictEqual({
              title,
              itemsTotal,
              itemsCompleted: 0,
            });
            expect(writeSpy).toHaveBeenNthCalledWith(1, emptyLines);
            expect(writeSpy).toHaveBeenNthCalledWith(2, `\x1b[${lineDelta}A`);
            expect(writeSpy).toHaveBeenNthCalledWith(3, "\x1b[2K\r");
            expect(writeSpy).toHaveBeenNthCalledWith(
              4,
              formattedBar + "\x1b[0K\r"
            );
            expect(writeSpy).toHaveBeenNthCalledWith(5, `\x1b[${lineDelta}B`);
          }
        );
      });

      describe("bars without preceding empty lines", () => {
        it.each(initFixtures.withLineDelta.withoutPrecedingEmptyLines)(
          "should init progress bar correctly",
          ({ color, title, lineDelta, itemsTotal, formattedBar }) => {
            const writeSpy = jest
              .spyOn(process.stdout, "write")
              .mockImplementation(jest.fn());
            const generateLabel = (_: any) => title;
            const progressBar = new ProgressBar(
              color,
              lineDelta,
              generateLabel
            );

            progressBar.init(title, itemsTotal);

            expect((progressBar as any).progress).toStrictEqual({
              title,
              itemsTotal,
              itemsCompleted: 0,
            });
            expect(writeSpy).toHaveBeenNthCalledWith(1, `\x1b[${lineDelta}A`);
            expect(writeSpy).toHaveBeenNthCalledWith(2, "\x1b[2K\r");
            expect(writeSpy).toHaveBeenNthCalledWith(
              3,
              formattedBar + "\x1b[0K\r"
            );
            expect(writeSpy).toHaveBeenNthCalledWith(4, `\x1b[${lineDelta}B`);
          }
        );
      });
    });
  });

  describe("advance", () => {
    describe("bars with lineDelta = 0", () => {
      it.each(advanceFixtures.withoutLineDelta)(
        "should advance progress from $initial => $expected",
        ({ color, title, itemsTotal, initial, expected, formattedBar }) => {
          const writeSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(jest.fn());
          const generateLabel = (_: any) => title;
          const progressBar = new ProgressBar(color, 0, generateLabel, {
            title,
            itemsCompleted: initial,
            itemsTotal,
          });

          progressBar.advance();

          expect((progressBar as any).progress).toStrictEqual({
            title,
            itemsTotal,
            itemsCompleted: expected,
          });
          expect(writeSpy).toHaveBeenNthCalledWith(1, "\x1b[2K\r");
          expect(writeSpy).toHaveBeenNthCalledWith(
            2,
            formattedBar + "\x1b[0K\r"
          );
        }
      );
    });

    describe("bars with lineDelta > 0", () => {
      it.each(advanceFixtures.withLineDelta)(
        "should advance progress from $initial => $expected",
        ({
          color,
          title,
          lineDelta,
          itemsTotal,
          initial,
          expected,
          formattedBar,
        }) => {
          const writeSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(jest.fn());
          const generateLabel = (_: any) => title;
          const progressBar = new ProgressBar(color, lineDelta, generateLabel, {
            title,
            itemsCompleted: initial,
            itemsTotal,
          });

          progressBar.advance();

          expect((progressBar as any).progress).toStrictEqual({
            title,
            itemsTotal,
            itemsCompleted: expected,
          });
          expect(writeSpy).toHaveBeenNthCalledWith(1, `\x1b[${lineDelta}A`);
          expect(writeSpy).toHaveBeenNthCalledWith(2, "\x1b[2K\r");
          expect(writeSpy).toHaveBeenNthCalledWith(
            3,
            formattedBar + "\x1b[0K\r"
          );
          expect(writeSpy).toHaveBeenNthCalledWith(4, `\x1b[${lineDelta}B`);
        }
      );
    });
  });

  describe("complete", () => {
    describe("bars with lineDelta = 0", () => {
      it.each(completeFixtures.withoutLineDelta)(
        "should complete progress bar",
        ({ color, title, itemsTotal, initial, formattedBar }) => {
          const writeSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(jest.fn());
          const generateLabel = (_: any) => title;
          const progressBar = new ProgressBar(color, 0, generateLabel, {
            title,
            itemsCompleted: initial,
            itemsTotal,
          });

          progressBar.complete();

          expect((progressBar as any).progress).toStrictEqual({
            title,
            itemsTotal,
            itemsCompleted: itemsTotal,
          });
          expect(writeSpy).toHaveBeenNthCalledWith(1, "\x1b[2K\r");
          expect(writeSpy).toHaveBeenNthCalledWith(
            2,
            formattedBar + "\x1b[0K\r"
          );
        }
      );
    });

    describe("bars with lineDelta > 0", () => {
      it.each(completeFixtures.withLineDelta)(
        "should complete progress bar",
        ({ color, title, lineDelta, itemsTotal, initial, formattedBar }) => {
          const writeSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(jest.fn());
          const generateLabel = (_: any) => title;
          const progressBar = new ProgressBar(color, lineDelta, generateLabel, {
            title,
            itemsCompleted: initial,
            itemsTotal,
          });

          progressBar.complete();

          expect((progressBar as any).progress).toStrictEqual({
            title,
            itemsTotal,
            itemsCompleted: itemsTotal,
          });
          expect(writeSpy).toHaveBeenNthCalledWith(1, `\x1b[${lineDelta}A`);
          expect(writeSpy).toHaveBeenNthCalledWith(2, "\x1b[2K\r");
          expect(writeSpy).toHaveBeenNthCalledWith(
            3,
            formattedBar + "\x1b[0K\r"
          );
          expect(writeSpy).toHaveBeenNthCalledWith(4, `\x1b[${lineDelta}B`);
        }
      );
    });
  });
});
