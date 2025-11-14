export const prepareAllChaptersFixtures = [
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
        ],
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
        ],
      },
      {
        title: "Chapter 2",
        url: "https://example.com/comic-2/chapter-2",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-2/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
      },
    ],
  },
];

export const prepareAllChaptersStartingAtFixtures = [
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
        ],
      },
      {
        title: "Chapter 2",
        url: "https://example.com/comic-1/chapter-2",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-1/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-2/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
      },
    ],
  },
];

export const prepareSelectionOfChaptersFixtures = [
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
        ],
      },
      {
        title: "Chapter 2",
        url: "https://example.com/comic-1/chapter-2",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-1/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-2/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
      },
    ],
  },
];

export const prepareChaptersInRangeFixtures = [
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
        ],
      },
      {
        title: "Chapter 2",
        url: "https://example.com/comic-1/chapter-2",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-1/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
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
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
        ],
      },
      {
        title: "Chapter 3",
        url: "https://example.com/comic-2/chapter-3",
        images: [
          {
            url: "img1",
            index: 0,
          },
          {
            url: "img2",
            index: 1,
          },
          {
            url: "img3",
            index: 2,
          },
          {
            url: "img4",
            index: 3,
          },
        ],
      },
    ],
  },
];

export const networkConnectionLostFixtures = [
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
  },
];
