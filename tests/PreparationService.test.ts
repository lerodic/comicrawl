import { DownloadOption } from "../src/config/constants";
import PreparationService from "../src/core/download/PreparationService";
import ConnectionInterrupted from "../src/core/error/errors/ConnectionInterrupted";
import EmptyGraphicNovel from "../src/core/error/errors/EmptyGraphicNovel";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import { limit } from "../src/utils/performance";
import {
  networkConnectionLostFixtures,
  prepareAllChaptersFixtures,
  prepareAllChaptersStartingAtFixtures,
  prepareChaptersInRangeFixtures,
  prepareSelectionOfChaptersFixtures,
} from "./fixtures/PreparationService.fixtures";

jest.mock("../src/utils/performance", () => ({
  limit: jest.fn(),
}));

describe("PreparationService", () => {
  let preparationService: PreparationService;
  let mockPrompt: jest.Mocked<Prompt>;
  let mockCrawler: jest.Mocked<Crawler>;
  let mockCrawlerFactory: jest.Mocked<CrawlerFactory>;
  let mockProgressManager: jest.Mocked<ProgressManager>;

  beforeEach(() => {
    (limit as jest.Mock).mockImplementation(async (tasks: any[]) => {
      return Promise.all(tasks.map((t) => t()));
    });

    mockPrompt = {
      getUrl: jest.fn(),
      getDownloadOption: jest.fn(),
      getChaptersStartingAt: jest.fn(),
      getChaptersFromList: jest.fn(),
      getChaptersEndpoint: jest.fn(),
    } as unknown as jest.Mocked<Prompt>;

    mockCrawler = {
      extractTitle: jest.fn(),
      extractChapters: jest.fn(),
      extractImageLinks: jest.fn(),
      terminate: jest.fn(),
    } as unknown as jest.Mocked<Crawler>;

    mockCrawlerFactory = {
      getCrawler: jest.fn().mockReturnValue(mockCrawler),
    } as unknown as jest.Mocked<CrawlerFactory>;

    mockProgressManager = {
      createPreparationBar: jest.fn(),
      advancePreparation: jest.fn(),
      completePreparation: jest.fn(),
    } as unknown as jest.Mocked<ProgressManager>;

    preparationService = new PreparationService(
      mockPrompt,
      mockCrawlerFactory,
      mockProgressManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("start", () => {
    it.each(prepareAllChaptersFixtures)(
      "should correctly prepare all chapters ($chapters.length) for '$title'",
      async ({ url, title, chapters, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue(DownloadOption.All);
        preparedChapters.forEach((chapter) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            chapter.images.map((image) => image.url)
          );
        });

        const result = await preparationService.start();

        expect(result).toStrictEqual({
          url,
          title,
          chapters: preparedChapters,
        });
        expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
          title,
          preparedChapters.length
        );
        preparedChapters.forEach((chapter) => {
          expect(mockCrawler.extractImageLinks).toHaveBeenCalledWith(
            chapter.url
          );
        });
        expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
          preparedChapters.length
        );
        expect(mockProgressManager.completePreparation).toHaveBeenCalled();
        expect(mockCrawler.terminate).toHaveBeenCalled();
      }
    );

    it.each(prepareAllChaptersStartingAtFixtures)(
      "should correctly prepare all chapters starting at $startingAt for '$title'",
      async ({ url, title, chapters, startingAt, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue(DownloadOption.Partial);
        mockPrompt.getChaptersStartingAt.mockResolvedValue(startingAt);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].images.map((image) => image.url)
          );
        });

        const result = await preparationService.start();

        expect(result).toStrictEqual({
          url,
          title,
          chapters: preparedChapters,
        });
        expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
          title,
          preparedChapters.length
        );
        preparedChapters.forEach((chapter) => {
          expect(mockCrawler.extractImageLinks).toHaveBeenCalledWith(
            chapter.url
          );
        });
        expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
          preparedChapters.length
        );
        expect(mockProgressManager.completePreparation).toHaveBeenCalled();
        expect(mockCrawler.terminate).toHaveBeenCalled();
      }
    );

    it.each(prepareSelectionOfChaptersFixtures)(
      "should correctly prepare custom selection of chapters for '$title'",
      async ({ url, title, chapters, selected, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue(
          DownloadOption.Selective
        );
        mockPrompt.getChaptersFromList.mockResolvedValue(selected);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].images.map((image) => image.url)
          );
        });

        const result = await preparationService.start();

        expect(result).toStrictEqual({
          url,
          title,
          chapters: preparedChapters,
        });
        expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
          title,
          preparedChapters.length
        );
        preparedChapters.forEach((chapter) => {
          expect(mockCrawler.extractImageLinks).toHaveBeenCalledWith(
            chapter.url
          );
        });
        expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
          preparedChapters.length
        );
        expect(mockProgressManager.completePreparation).toHaveBeenCalled();
        expect(mockCrawler.terminate).toHaveBeenCalled();
      }
    );

    it.each(prepareChaptersInRangeFixtures)(
      "should correctly prepare chapters between $from and $to",
      async ({ url, title, chapters, from, to, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue(DownloadOption.Range);
        mockPrompt.getChaptersStartingAt.mockResolvedValue(from);
        mockPrompt.getChaptersEndpoint.mockResolvedValue(to);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].images.map((image) => image.url)
          );
        });

        const result = await preparationService.start();

        expect(result).toStrictEqual({
          url,
          title,
          chapters: preparedChapters,
        });
        expect(mockProgressManager.createPreparationBar).toHaveBeenCalledWith(
          title,
          preparedChapters.length
        );
        preparedChapters.forEach((chapter) => {
          expect(mockCrawler.extractImageLinks).toHaveBeenCalledWith(
            chapter.url
          );
        });
        expect(mockProgressManager.advancePreparation).toHaveBeenCalledTimes(
          preparedChapters.length
        );
        expect(mockProgressManager.completePreparation).toHaveBeenCalled();
        expect(mockCrawler.terminate).toHaveBeenCalled();
      }
    );

    it.each(networkConnectionLostFixtures)(
      "should throw 'ConnectionInterrupted' if network connection is lost during chapter preparation",
      async ({ url, title, chapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue(DownloadOption.All);
        mockCrawler.extractImageLinks.mockImplementationOnce(async () => {
          throw new Error();
        });

        await expect(preparationService.start()).rejects.toThrow(
          ConnectionInterrupted
        );
      }
    );

    it("should throw 'EmptyGraphicNovel' error if no chapters can be found", async () => {
      mockPrompt.getUrl.mockResolvedValue("https://example.com");
      mockCrawler.extractTitle.mockResolvedValue("Comic 1");
      mockCrawler.extractChapters.mockResolvedValue([]);

      await expect(preparationService.start()).rejects.toThrow(
        EmptyGraphicNovel
      );
    });
  });
});
