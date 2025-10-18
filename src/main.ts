import "reflect-metadata";
import ComicrawlFactory from "./core/factories/ComicrawlFactory";

const comicrawl = ComicrawlFactory.create();
comicrawl.run();
