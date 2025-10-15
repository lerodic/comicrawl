import "reflect-metadata";
import Prompt from "../src/core/io/Prompt";
import Logger from "../src/core/io/Logger";
import inquirer from "inquirer";
import CONFIG from "../src/config/app.config";

jest.mock("inquirer");
jest.mock("../src/config/app.config", () => ({
  __esModule: true,
  default: {
    SUPPORTED_DOMAINS: ["https://mocked.com", "https://mocked2.com"],
    EXECUTABLE_PATH: "/mocked/path",
  },
}));

describe("Prompt", () => {
  let prompt: Prompt;
  let mockLogger: jest.Mocked<Logger>;
  let mockInquirer = inquirer as jest.Mocked<typeof inquirer>;
  const mockedConfig = CONFIG as jest.Mocked<typeof CONFIG>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    prompt = new Prompt(mockLogger);
  });

  describe("getUrl", () => {
    it.each(mockedConfig.SUPPORTED_DOMAINS)(
      "should return '%s' if user enters a valid URL",
      async (url) => {
        mockInquirer.prompt.mockResolvedValue({ url });

        const result = await prompt.getUrl();

        expect(result).toStrictEqual(url);
      }
    );

    it.each([
      "https://invalid.com",
      "http://mocked.com",
      "https://mocked.co",
      "invalid.com",
    ])(
      "should log error if user enters malformatted/unsupported URL: '%s'",
      async (url) => {
        mockInquirer.prompt.mockResolvedValueOnce({ url });
        const getUrlSpy = jest
          .spyOn(prompt, "getUrl")
          .mockImplementationOnce(Prompt.prototype.getUrl)
          .mockResolvedValueOnce("mocked-second-call");

        const result = await prompt.getUrl();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "\nPlease enter a valid URL. Below is a list of valid domains:\n"
        );
        expect(mockLogger.info).toHaveBeenCalledTimes(
          mockedConfig.SUPPORTED_DOMAINS.length
        );
        expect(result).toStrictEqual("mocked-second-call");
        expect(getUrlSpy).toHaveBeenCalledTimes(2);
      }
    );
  });

  describe("getChaptersStartingAt", () => {
    it.each([
      {
        startingPoint: 1,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
        ],
      },
      {
        startingPoint: 2,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
        ],
      },
    ])(
      "should return '$startingPoint' if user enters a valid starting point",
      async ({ startingPoint, chapters }) => {
        mockInquirer.prompt.mockResolvedValueOnce({ startingPoint });

        const result = await prompt.getChaptersStartingAt(chapters);

        expect(result).toStrictEqual(startingPoint);
      }
    );

    it.each([
      {
        startingPoint: 0,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
        ],
      },
      {
        startingPoint: 4,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
        ],
      },
      {
        startingPoint: -1,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
        ],
      },
    ])(
      "should log error if user enters invalid starting point: '$startingPoint'",
      async ({ startingPoint, chapters }) => {
        mockInquirer.prompt.mockResolvedValueOnce({ startingPoint });
        const getChaptersStartingAtSpy = jest
          .spyOn(prompt, "getChaptersStartingAt")
          .mockImplementationOnce(Prompt.prototype.getChaptersStartingAt)
          .mockResolvedValueOnce(1);

        const result = await prompt.getChaptersStartingAt(chapters);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `\nInvalid chapter selection. Value must be >= 1 and <= ${chapters.length}.\n`
        );
        expect(getChaptersStartingAtSpy).toHaveBeenCalledTimes(2);
        expect(result).toStrictEqual(1);
      }
    );
  });

  describe("getChaptersEndpoint", () => {
    it.each([
      {
        startingPoint: 3,
        endPoint: 5,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
          { title: "4", url: "4" },
          { title: "5", url: "5" },
        ],
      },
      {
        startingPoint: 4,
        endPoint: 5,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
          { title: "4", url: "4" },
          { title: "5", url: "5" },
        ],
      },
    ])(
      "should return '$endPoint' if user enters a valid end point",
      async ({ startingPoint, endPoint, chapters }) => {
        mockInquirer.prompt.mockResolvedValueOnce({ endPoint });

        const result = await prompt.getChaptersEndpoint(
          startingPoint,
          chapters
        );

        expect(result).toStrictEqual(endPoint);
      }
    );

    it.each([
      {
        startingPoint: 3,
        endPoint: 2,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
          { title: "4", url: "4" },
          { title: "5", url: "5" },
        ],
      },
      {
        startingPoint: 3,
        endPoint: 2,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
          { title: "4", url: "4" },
          { title: "5", url: "5" },
        ],
      },
      {
        startingPoint: 3,
        endPoint: 6,
        chapters: [
          { title: "1", url: "1" },
          { title: "2", url: "2" },
          { title: "3", url: "3" },
          { title: "4", url: "4" },
          { title: "5", url: "5" },
        ],
      },
    ])(
      "should log error if user enters invalid end point: '$endPoint'",
      async ({ startingPoint, endPoint, chapters }) => {
        mockInquirer.prompt.mockResolvedValueOnce({ endPoint });
        const getChaptersEndpointSpy = jest
          .spyOn(prompt, "getChaptersEndpoint")
          .mockImplementationOnce(Prompt.prototype.getChaptersEndpoint)
          .mockResolvedValueOnce(chapters.length);

        const result = await prompt.getChaptersEndpoint(
          startingPoint,
          chapters
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          `\nInvalid chapter selection. Value must be >= ${startingPoint} and <= ${chapters.length}.\n`
        );
        expect(getChaptersEndpointSpy).toHaveBeenCalledTimes(2);
        expect(result).toStrictEqual(chapters.length);
      }
    );
  });
});
