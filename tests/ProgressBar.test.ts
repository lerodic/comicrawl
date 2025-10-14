import "reflect-metadata";
import ProgressBar from "../src/core/io/ProgressBar";
import chalk from "chalk";

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
        it.each([
          {
            color: chalk.greenBright,
            title: "Bar 1",
            itemsTotal: 20,
            numEmptyLines: 1,
            emptyLines: "\n",
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
          },
          {
            color: chalk.greenBright,
            title: "Bar 2",
            itemsTotal: 268,
            numEmptyLines: 3,
            emptyLines: "\n\n\n",
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
          },
        ])(
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
        it.each([
          {
            color: chalk.greenBright,
            title: "Bar 1",
            itemsTotal: 20,
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
          },
          {
            color: chalk.greenBright,
            title: "Bar 2",
            itemsTotal: 268,
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
          },
        ])(
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
        it.each([
          {
            color: chalk.greenBright,
            title: "Bar 1",
            lineDelta: 1,
            itemsTotal: 20,
            numEmptyLines: 1,
            emptyLines: "\n",
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
          },
          {
            color: chalk.greenBright,
            title: "Bar 2",
            lineDelta: 2,
            itemsTotal: 268,
            numEmptyLines: 3,
            emptyLines: "\n\n\n",
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
          },
        ])(
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
        it.each([
          {
            color: chalk.greenBright,
            title: "Bar 1",
            lineDelta: 1,
            itemsTotal: 20,
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
          },
          {
            color: chalk.greenBright,
            title: "Bar 2",
            lineDelta: 2,
            itemsTotal: 268,
            formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
          },
        ])(
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
      it.each([
        {
          color: chalk.greenBright,
          title: "Bar 1",
          itemsTotal: 20,
          initial: 4,
          expected: 5,
          formattedBar: "████████░░░░░░░░░░░░░░░░░░░░░░ 25% | Bar 1 (5/20)",
        },
        {
          color: chalk.greenBright,
          title: "Bar 2",
          itemsTotal: 450,
          initial: 359,
          expected: 360,
          formattedBar: "████████████████████████░░░░░░ 80% | Bar 2 (360/450)",
        },
      ])(
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
      it.each([
        {
          color: chalk.greenBright,
          title: "Bar 1",
          lineDelta: 1,
          itemsTotal: 20,
          initial: 4,
          expected: 5,
          formattedBar: "████████░░░░░░░░░░░░░░░░░░░░░░ 25% | Bar 1 (5/20)",
        },
        {
          color: chalk.greenBright,
          title: "Bar 2",
          lineDelta: 2,
          itemsTotal: 450,
          initial: 359,
          expected: 360,
          formattedBar: "████████████████████████░░░░░░ 80% | Bar 2 (360/450)",
        },
      ])(
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
      it.each([
        {
          color: chalk.greenBright,
          title: "Bar 1",
          itemsTotal: 20,
          initial: 4,
          formattedBar: "██████████████████████████████ 100% | Bar 1 (20/20)",
        },
        {
          color: chalk.greenBright,
          title: "Bar 2",
          itemsTotal: 450,
          initial: 359,
          formattedBar: "██████████████████████████████ 100% | Bar 2 (450/450)",
        },
      ])(
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
      it.each([
        {
          color: chalk.greenBright,
          title: "Bar 1",
          lineDelta: 1,
          itemsTotal: 20,
          initial: 4,
          formattedBar: "██████████████████████████████ 100% | Bar 1 (20/20)",
        },
        {
          color: chalk.greenBright,
          title: "Bar 2",
          lineDelta: 2,
          itemsTotal: 450,
          initial: 359,
          formattedBar: "██████████████████████████████ 100% | Bar 2 (450/450)",
        },
      ])(
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
