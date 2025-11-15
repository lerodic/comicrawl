import "reflect-metadata";
import Chromium from "../src/core/crawl/Chromium";
import MissingChromiumInstance from "../src/core/error/errors/MissingChromiumInstance";
import CONFIG from "../src/config/app.config";
import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { PuppeteerBlocker } from "@ghostery/adblocker-puppeteer";

jest.mock("puppeteer");
jest.mock("puppeteer-extra");
jest.mock("puppeteer-extra-plugin-stealth", () => {
  return {
    __esModule: true,
    default: jest.fn(() => "stealth-plugin-mock"),
  };
});
jest.mock("cross-fetch", () => jest.fn());
jest.mock("@ghostery/adblocker-puppeteer", () => ({
  PuppeteerBlocker: {
    fromPrebuiltAdsAndTracking: jest.fn(),
  },
}));
jest.mock("../src/config/app.config", () => ({
  __esModule: true,
  default: {
    SUPPORTED_DOMAINS: ["https://mocked.com", "https://mocked2.com"],
    EXECUTABLE_PATH: "/mocked/path",
  },
}));

describe("Chromium", () => {
  let chromium: Chromium;
  let mockPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;
  let mockBlocker: jest.Mocked<PuppeteerBlocker>;

  beforeEach(() => {
    mockPage = {
      setDefaultTimeout: jest.fn(),
      setDefaultNavigationTimeout: jest.fn(),
      goto: jest.fn(),
      isClosed: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Page>;

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
      pages: jest.fn().mockResolvedValue([mockPage]),
    } as unknown as jest.Mocked<Browser>;

    mockBlocker = {
      enableBlockingInPage: jest.fn(),
    } as unknown as jest.Mocked<PuppeteerBlocker>;

    chromium = new Chromium();
  });

  afterEach(() => {
    jest.clearAllMocks();

    CONFIG.SUPPORTED_DOMAINS = [
      "https://mocked.com",
      "https://another-mocked.com",
    ];
    CONFIG.EXECUTABLE_PATH = "/mocked/path";
  });

  describe("openPage", () => {
    it("should set up new page correctly", async () => {
      CONFIG.EXECUTABLE_PATH = undefined;
      mockPuppeteer.launch.mockResolvedValue(mockBrowser);
      (PuppeteerBlocker.fromPrebuiltAdsAndTracking as any).mockResolvedValue(
        mockBlocker
      );

      await chromium.openPage("https://somepage.com");

      expect(mockPage.setDefaultTimeout).toHaveBeenCalledWith(0);
      expect(mockPage.setDefaultNavigationTimeout).toHaveBeenCalledWith(0);
      expect(mockBlocker.enableBlockingInPage).toHaveBeenCalled();
    });

    it.each(["https://example.com", "https://another-one.com"])(
      "should navigate to %s using bundled-in chromium instance",
      async (url) => {
        CONFIG.EXECUTABLE_PATH = undefined;
        mockPuppeteer.launch.mockResolvedValue(mockBrowser);
        (PuppeteerBlocker.fromPrebuiltAdsAndTracking as any).mockResolvedValue(
          mockBlocker
        );

        const result = await chromium.openPage(url);

        expect(mockPuppeteer.launch).not.toHaveBeenCalledWith({
          executablePath: CONFIG.EXECUTABLE_PATH,
        });
        expect(result).toStrictEqual(mockPage);
      }
    );

    it.each(["https://example.com", "https://another-one.com"])(
      "should navigate to %s using user-defined chromium instance",
      async (url) => {
        mockPuppeteer.launch.mockResolvedValue(mockBrowser);
        (PuppeteerBlocker.fromPrebuiltAdsAndTracking as any).mockResolvedValue(
          mockBlocker
        );

        const result = await chromium.openPage(url);

        expect(mockPuppeteer.launch).toHaveBeenCalledWith({
          executablePath: CONFIG.EXECUTABLE_PATH,
          headless: true,
          args: ["--window-size=1280, 720"],
        });
        expect(result).toStrictEqual(mockPage);
      }
    );

    it.each([
      {
        url: "https://example.com",
        path: "some/random/path",
      },
      {
        url: "https://another-one.com",
        path: "some/other/path",
      },
    ])(
      "should throw 'MissingChromiumInstance' error if user-defined instance could not be found",
      async ({ url, path }) => {
        mockPuppeteer.launch.mockImplementation(() => {
          throw new MissingChromiumInstance(path);
        });

        await expect(chromium.openPage(url)).rejects.toThrow(
          MissingChromiumInstance
        );
      }
    );
  });

  describe("terminate", () => {
    it("should close browser", async () => {
      mockPuppeteer.launch.mockResolvedValue(mockBrowser);
      await chromium.openPage("example.com");

      await chromium.terminate();

      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });
  });
});
