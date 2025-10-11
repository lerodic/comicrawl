import Chromium from "../../core/crawl/Chromium";
import TYPES from "./inversify.types";
import { Container } from "inversify";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Chromium>(TYPES.Chromium).to(Chromium).inSingletonScope();

  return container;
}

const container = setupContainer();

export default container;
