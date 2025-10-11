import Chromium from "../../core/crawl/Chromium";
import Logger from "../../core/io/Logger";
import Prompt from "../../core/io/Prompt";
import TYPES from "./inversify.types";
import { Container } from "inversify";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Prompt>(TYPES.Prompt).to(Prompt);

  container.bind<Logger>(TYPES.Logger).to(Logger);

  container.bind<Chromium>(TYPES.Chromium).to(Chromium).inSingletonScope();

  return container;
}

const container = setupContainer();

export default container;
