import ConnectionInterrupted from "../../src/core/error/errors/ConnectionInterrupted";
import EmptyGraphicNovel from "../../src/core/error/errors/EmptyGraphicNovel";
import LogFileCreationFailed from "../../src/core/error/errors/LogFileCreationFailed";

export const applicationErrors = [
  {
    type: "EmptyGraphicNovel",
    err: new EmptyGraphicNovel("Title 1"),
    message: "'Title 1' is empty. Aborting.",
  },
  {
    type: "LogFileCreationFailed",
    err: new LogFileCreationFailed(),
    message:
      "Failed to create log file. Run Comicrawl again with elevated privileges.",
  },
];

export const networkErrors = [
  {
    err: new Error("getaddrinfo ENOTFOUND"),
  },
  {
    err: new Error("getaddrinfo ENOTFOUND https://example.com"),
  },
  {
    err: new Error("net::ERR_INTERNET_DISCONNECTED"),
  },
  {
    err: new ConnectionInterrupted(),
  },
];
