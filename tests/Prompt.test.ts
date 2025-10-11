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
          "Please enter a valid URL. Below is a list of valid domains:\n"
        );
        expect(mockLogger.info).toHaveBeenCalledTimes(
          mockedConfig.SUPPORTED_DOMAINS.length
        );
        expect(result).toStrictEqual("mocked-second-call");
        expect(getUrlSpy).toHaveBeenCalledTimes(2);
      }
    );
  });
});
