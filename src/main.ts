import "reflect-metadata";
import ComicrawlFactory from "./core/factories/ComicrawlFactory";

const comicrawl = ComicrawlFactory.create();

process.on("SIGINT", async () => {
  await comicrawl.closeBrowser();
  process.exit(0);
});

comicrawl.run();
