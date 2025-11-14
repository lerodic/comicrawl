import { DownloadOption } from "../../src/config/constants";

export const malformattedUrls = [
  "https://invalid.com",
  "http://mocked.com",
  "https://mocked.co",
  "invalid.com",
];

export const getDownloadOptionFixtures = [
  { title: "Comic 1", itemsTotal: 15, downloadOption: DownloadOption.All },
  {
    title: "Comic 2",
    itemsTotal: 30,
    downloadOption: DownloadOption.Partial,
  },
  {
    title: "Comic 3",
    itemsTotal: 120,
    downloadOption: DownloadOption.Selective,
  },
  {
    title: "Comic 4",
    itemsTotal: 19,
    downloadOption: DownloadOption.Range,
  },
];

export const getChaptersStartingAtFixtures = {
  validStartingPoint: [
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
  ],
  invalidStartingPointFixtures: [
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
  ],
};

export const getChaptersEndpointFixtures = {
  validEndpoint: [
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
  ],
  invalidEndpoint: [
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
  ],
};
