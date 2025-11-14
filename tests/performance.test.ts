import { limit } from "../src/utils/performance";
import os from "os";
import pLimit from "p-limit";
import { limitFixtures } from "./fixtures/performance.fixtures";

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
    it.each(limitFixtures)(
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
