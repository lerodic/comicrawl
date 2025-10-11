import container from "../../config/inversify/inversify.config";
import TYPES from "../../config/inversify/inversify.types";
import Comicrawl from "../Comicrawl";

class ComicrawlFactory {
  static create(): Comicrawl {
    return container.get<Comicrawl>(TYPES.Comicrawl);
  }
}

export default ComicrawlFactory;
