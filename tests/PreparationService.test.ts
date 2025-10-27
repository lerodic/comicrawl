import PreparationService from "../src/core/download/PreparationService";
import CrawlerFactory from "../src/core/factories/CrawlerFactory";
import ProgressManager from "../src/core/io/progress/ProgressManager";
import Prompt from "../src/core/io/Prompt";
import { Crawler } from "../src/types";
import { limit } from "../src/utils/performance";

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
    it.each([
      {
        url: "https://example.com/comic-1",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
          },
        ],
        preparedChapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
        ],
      },
      {
        url: "https://example.com/comic-2",
        title: "Comic 2",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-2/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
          },
        ],
        preparedChapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-2/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
    ])(
      "should correctly prepare all chapters ($chapters.length) for '$title'",
      async ({ url, title, chapters, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue("All");
        preparedChapters.forEach((chapter) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            chapter.imageLinks
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

    it.each([
      {
        url: "https://example.com/comic-1",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
          },
        ],
        startingAt: 1,
        preparedChapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
      {
        url: "https://example.com/comic-2",
        title: "Comic 2",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-2/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
          },
        ],
        startingAt: 2,
        preparedChapters: [
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
    ])(
      "should correctly prepare all chapters starting at $startingAt for '$title'",
      async ({ url, title, chapters, startingAt, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue("Partial");
        mockPrompt.getChaptersStartingAt.mockResolvedValue(startingAt);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].imageLinks
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

    it.each([
      {
        url: "https://example.com/comic-1",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
          },
        ],
        selected: ["Chapter 1", "Chapter 2", "Chapter 3"],
        preparedChapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
      {
        url: "https://example.com/comic-2",
        title: "Comic 2",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-2/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
          },
        ],
        selected: ["Chapter 2", "Chapter 3"],
        preparedChapters: [
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
    ])(
      "should correctly prepare custom selection of chapters for '$title'",
      async ({ url, title, chapters, selected, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue("Selective");
        mockPrompt.getChaptersFromList.mockResolvedValue(selected);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].imageLinks
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

    it.each([
      {
        url: "https://example.com/comic-1",
        title: "Comic 1",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
          },
        ],
        from: 1,
        to: 3,
        preparedChapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-1/chapter-1",
            imageLinks: ["img1", "img2", "img3"],
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-1/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-1/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
      {
        url: "https://example.com/comic-2",
        title: "Comic 2",
        chapters: [
          {
            title: "Chapter 1",
            url: "https://example.com/comic-2/chapter-1",
          },
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
          },
        ],
        from: 2,
        to: 3,
        preparedChapters: [
          {
            title: "Chapter 2",
            url: "https://example.com/comic-2/chapter-2",
            imageLinks: ["img1", "img2"],
          },
          {
            title: "Chapter 3",
            url: "https://example.com/comic-2/chapter-3",
            imageLinks: ["img1", "img2", "img3", "img4"],
          },
        ],
      },
    ])(
      "should correctly prepare chapters between $from and $to",
      async ({ url, title, chapters, from, to, preparedChapters }) => {
        mockPrompt.getUrl.mockResolvedValue(url);
        mockCrawler.extractTitle.mockResolvedValue(title);
        mockCrawler.extractChapters.mockResolvedValue(chapters);
        mockPrompt.getDownloadOption.mockResolvedValue("Range");
        mockPrompt.getChaptersStartingAt.mockResolvedValue(from);
        mockPrompt.getChaptersEndpoint.mockResolvedValue(to);
        preparedChapters.forEach((_, index) => {
          mockCrawler.extractImageLinks.mockResolvedValueOnce(
            preparedChapters[index].imageLinks
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

    it("should throw 'EmptyGraphicNovel' error if no chapters can be found", async () => {});
  });
});
