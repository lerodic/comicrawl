import { limit } from "../src/utils/performance";
import os from "os";
import pLimit from "p-limit";

jest.mock("os");
jest.mock("p-limit", () => {
  return jest.fn((_: number) => {
    const fn = (task: (...args: any[]) => any) => task();
    return fn;
  });
});

describe("performance", () => {
  const mockOs = os as jest.Mocked<typeof os>;
  const mockPLimit = pLimit as jest.MockedFunction<typeof pLimit>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("limit", () => {
    it.each([
      {
        memoryInGb: 16,
        concurrencyLevel: 5,
        tasks: [
          async () => 1,
          async () => 2,
          async () => 3,
          async () => 4,
          async () => 5,
        ],
        expected: [1, 2, 3, 4, 5],
      },
      {
        memoryInGb: 15,
        concurrencyLevel: 2,
        tasks: [
          async () => 1,
          async () => 2,
          async () => 3,
          async () => 4,
          async () => 5,
        ],
        expected: [1, 2, 3, 4, 5],
      },
      {
        memoryInGb: 32,
        concurrencyLevel: 10,
        tasks: [
          async () => 1,
          async () => 2,
          async () => 3,
          async () => 4,
          async () => 5,
          async () => 6,
          async () => 7,
          async () => 8,
          async () => 9,
          async () => 10,
        ],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        memoryInGb: 64,
        concurrencyLevel: 15,
        tasks: [
          async () => 1,
          async () => 2,
          async () => 3,
          async () => 4,
          async () => 5,
          async () => 6,
          async () => 7,
          async () => 8,
          async () => 9,
          async () => 10,
        ],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        memoryInGb: 128,
        concurrencyLevel: 20,
        tasks: [
          async () => 1,
          async () => 2,
          async () => 3,
          async () => 4,
          async () => 5,
          async () => 6,
          async () => 7,
          async () => 8,
          async () => 9,
          async () => 10,
        ],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
    ])(
      "should limit execution to $concurrencyLevel for machine with $memoryInGb GB of RAM",
      async ({ memoryInGb, concurrencyLevel, tasks, expected }) => {
        mockOs.totalmem.mockReturnValue(memoryInGb * Math.pow(1024, 3));

        const result = await limit(tasks);

        expect(result).toStrictEqual(expected);
        expect(mockPLimit).toHaveBeenCalledWith(concurrencyLevel);
      }
    );
  });
});
