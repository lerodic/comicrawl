import { getConcurrencyLevel } from "../src/utils/performance";
import os from "os";

describe("performance", () => {
  describe("getConcurrencyLevel", () => {
    it.each([
      {
        memoryInGb: 6,
        expected: 1,
      },
      {
        memoryInGb: 7,
        expected: 1,
      },
      {
        memoryInGb: 8,
        expected: 2,
      },
      {
        memoryInGb: 9,
        expected: 2,
      },
      {
        memoryInGb: 15,
        expected: 2,
      },
      {
        memoryInGb: 16,
        expected: 5,
      },
      {
        memoryInGb: 17,
        expected: 5,
      },
      {
        memoryInGb: 31,
        expected: 5,
      },
      {
        memoryInGb: 32,
        expected: 10,
      },
      {
        memoryInGb: 33,
        expected: 10,
      },
      {
        memoryInGb: 63,
        expected: 10,
      },
      {
        memoryInGb: 64,
        expected: 15,
      },
      {
        memoryInGb: 64,
        expected: 15,
      },
      {
        memoryInGb: 127,
        expected: 15,
      },
      {
        memoryInGb: 128,
        expected: 20,
      },
      {
        memoryInGb: 129,
        expected: 20,
      },
      {
        memoryInGb: 256,
        expected: 20,
      },
    ])(
      "should return $expected for $memoryInGb GB RAM",
      ({ memoryInGb, expected }) => {
        const memory = memoryInGb * Math.pow(1024, 3);
        jest.spyOn(os, "totalmem").mockReturnValue(memory);

        const result = getConcurrencyLevel();

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
