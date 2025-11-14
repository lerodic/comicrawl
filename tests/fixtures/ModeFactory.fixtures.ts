import { DefiniteLogFileContent } from "../../src/types";

export const noErrorsLogFileContent: DefiniteLogFileContent[] = [
  {
    comic: {
      title: "Comic 1",
      url: "https://example.com/comic-1",
    },
    createdAt: new Date(123),
    failedDownloads: {},
    sourceOfTermination: "Program",
  },
  {
    comic: {
      title: "Comic 2",
      url: "https://example.com/comic-2",
    },
    createdAt: new Date(123),
    failedDownloads: {},
    sourceOfTermination: "Error",
  },
];

export const logFileWithErrors: DefiniteLogFileContent[] = [
  {
    comic: {
      title: "Comic 1",
      url: "https://example.com/comic-1",
    },
    createdAt: new Date(123),
    failedDownloads: {
      "Chapter 1": [
        {
          url: "https://example.com/comic-1/chapter-1/img35.png",
          index: 0,
        },
      ],
    },
    sourceOfTermination: "Program",
  },
  {
    comic: {
      title: "Comic 2",
      url: "https://example.com/comic-2",
    },
    createdAt: new Date(123),
    failedDownloads: {
      "Chapter 1": [
        {
          url: "https://example.com/comic-2/chapter-1/img35.png",
          index: 0,
        },
      ],
      "Chapter 2": [
        {
          url: "https://example.com/comic-2/chapter-2/img1.png",
          index: 0,
        },
        {
          url: "https://example.com/comic-2/chapter-2/img12.png",
          index: 12,
        },
      ],
    },
    sourceOfTermination: "Error",
  },
];
