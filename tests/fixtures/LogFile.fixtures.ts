export const registerFailedDownloadFixtures = [
  {
    initial: [
      {
        chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
        image: { index: 20, url: "example.com/chapter-1/20" },
      },
    ],
  },
  {
    initial: [
      {
        chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
        image: { index: 20, url: "example.com/chapter-1/20" },
      },
      {
        chapter: { title: "Chapter 1", url: "example.com/chapter-1" },
        image: { index: 24, url: "example.com/chapter-1/24" },
      },
    ],
  },
];

export const dumpFixtures = [
  {
    title: "Comic 1",
    url: "example.com/comic-1",
    failedDownloads: [],
    sourceOfTermination: "User",
    grouped: {},
  },
  {
    title: "Comic 1",
    url: "example.com/comic-1",
    failedDownloads: [
      {
        chapter: { title: "Chapter 1", url: "/chapter1" },
        image: { index: 1, url: "/img1" },
      },
    ],
    sourceOfTermination: "Error",
    grouped: {
      "Chapter 1": [{ index: 1, url: "/img1" }],
    },
  },
  {
    title: "Comic 1",
    url: "example.com/comic-1",
    failedDownloads: [
      {
        chapter: { title: "Chapter 1", url: "/chapter1" },
        image: { index: 1, url: "/img1" },
      },
      {
        chapter: { title: "Chapter 1", url: "/chapter1" },
        image: { index: 10, url: "/img10" },
      },
      {
        chapter: { title: "Chapter 2", url: "/chapter2" },
        image: { index: 1, url: "/img1" },
      },
    ],
    sourceOfTermination: "Program",
    grouped: {
      "Chapter 1": [
        { index: 1, url: "/img1" },
        { index: 10, url: "/img10" },
      ],
      "Chapter 2": [{ index: 1, url: "/img1" }],
    },
  },
];

export const validLogFileContentFixtures = [
  {
    comic: {
      title: "",
      url: "",
    },
    createdAt: new Date(123).toISOString(),
    failedDownloads: {},
    sourceOfTermination: "User",
  },
];

export const invalidLogFileContentFixtures = [
  {},
  {
    comic: {},
  },
  {
    comic: {
      title: "Comic 1",
      url: 123,
    },
  },
  {
    comic: {
      title: "Comic 1",
      url: "https://example.com/comic-1",
    },
    createdAt: new Date(123),
    failedDownloads: {},
  },
];
