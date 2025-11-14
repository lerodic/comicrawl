export const runFixtures = [
  {
    logFileContent: {
      comic: {
        title: "Comic 1",
        url: "https://example.com/comic-1",
      },
      createdAt: new Date(123),
      failedDownloads: {
        "Chapter 1": [
          {
            url: "https://example.com/comic-1/chapter-1/img2.png",
            index: 1,
          },
          {
            url: "https://example.com/comic-1/chapter-1/img3.png",
            index: 2,
          },
        ],
      },
      sourceOfTermination: "Program",
    },
    converted: [
      {
        title: "Chapter 1",
        url: "",
        images: [
          {
            url: "https://example.com/comic-1/chapter-1/img2.png",
            index: 1,
          },
          {
            url: "https://example.com/comic-1/chapter-1/img3.png",
            index: 2,
          },
        ],
      },
    ],
  },
  {
    logFileContent: {
      comic: {
        title: "Comic 2",
        url: "https://example.com/comic-2",
      },
      createdAt: new Date(123),
      failedDownloads: {
        "Chapter 1": [
          {
            url: "https://example.com/comic-2/chapter-1/img1.png",
            index: 0,
          },
          {
            url: "https://example.com/comic-2/chapter-1/img8.png",
            index: 7,
          },
        ],
        "Chapter 2": [
          {
            url: "https://example.com/comic-2/chapter-2/img19.png",
            index: 19,
          },
        ],
      },
      sourceOfTermination: "Program",
    },
    converted: [
      {
        title: "Chapter 1",
        url: "",
        images: [
          {
            url: "https://example.com/comic-2/chapter-1/img1.png",
            index: 0,
          },
          {
            url: "https://example.com/comic-2/chapter-1/img8.png",
            index: 7,
          },
        ],
      },
      {
        title: "Chapter 2",
        url: "",
        images: [
          {
            url: "https://example.com/comic-2/chapter-2/img19.png",
            index: 19,
          },
        ],
      },
    ],
  },
];
