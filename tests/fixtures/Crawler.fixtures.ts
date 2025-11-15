export const extractTitleFixtures = [
  {
    url: "https://example.com",
    title: "First Manga",
  },
  {
    url: "https://another-example.com",
    title: "Second Manga",
  },
];

export const extractChaptersFixtures = [
  {
    url: "https://test.com",
    links: [
      {
        href: "https://test.com/chapter1",
        relativeLink: "/chapter1",
        textContent: "Chapter 1",
      },
      {
        href: "https://test.com/chapter2",
        relativeLink: "/chapter2",
        textContent: "Chapter 2",
      },
    ],
  },
];

export const extractImageLinksFixtures = [
  {
    images: [
      {
        src: "https://example.com/chapter-1/image-1",
      },
      {
        src: "https://example.com/chapter-1/image-2",
      },
      {
        src: "https://example.com/chapter-1/image-3",
      },
    ],
    url: "https://example.com",
  },
];
