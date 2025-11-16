import Comicrawl from "../../core/Comicrawl";
import Chromium from "../../core/crawl/Chromium";
import CrawlerFactory from "../../core/factories/CrawlerFactory";
import Logger from "../../core/io/Logger";
import ProgressBar from "../../core/io/progress/ProgressBar";
import ProgressManager from "../../core/io/progress/ProgressManager";
import Prompt from "../../core/io/Prompt";
import { Crawler, CrawlerFactoryFn, Mode, ModeFactoryFn } from "../../types";
import CONFIG from "../app.config";
import {
  CHAPTER_PROGRESS_BAR,
  COMIC_PROGRESS_BAR,
  PREPARATION_PROGRESS_BAR,
} from "../constants";
import TYPES from "./inversify.types";
import { Container } from "inversify";
import ErrorHandler from "../../core/error/ErrorHandler";
import DownloadService from "../../core/download/DownloadService";
import PreparationService from "../../core/download/PreparationService";
import LogFile from "../../core/io/LogFile";
import ModeFactory from "../../core/factories/ModeFactory";
import DefaultMode from "../../core/modes/DefaultMode";
import FailedDownloadsMode from "../../core/modes/FailedDownloadsMode";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Comicrawl>(TYPES.Comicrawl).to(Comicrawl);

  container.bind<Prompt>(TYPES.Prompt).to(Prompt);

  container.bind<Logger>(TYPES.Logger).to(Logger);

  container
    .bind<CrawlerFactory>(TYPES.CrawlerFactory)
    .to(CrawlerFactory)
    .inSingletonScope();

  container.bind<CrawlerFactoryFn>(TYPES.CrawlerFactoryFn).toFactory(() => {
    return (url: string) => {
      for (const [_, sourceInfo] of CONFIG.SOURCE_MAP) {
        if (sourceInfo.origins.some((origin) => url.startsWith(origin))) {
          container
            .bind<Crawler>(TYPES.Crawler)
            .to(sourceInfo.class)
            .inSingletonScope();

          break;
        }
      }

      return container.get<Crawler>(TYPES.Crawler);
    };
  });

  container.bind<Chromium>(TYPES.Chromium).to(Chromium).inSingletonScope();

  container
    .bind<ProgressManager>(TYPES.ProgressManager)
    .to(ProgressManager)
    .inSingletonScope();

  container
    .bind<ProgressBar>(TYPES.PreparationProgressBar)
    .toConstantValue(PREPARATION_PROGRESS_BAR);

  container
    .bind<ProgressBar>(TYPES.ComicProgressBar)
    .toConstantValue(COMIC_PROGRESS_BAR);

  container
    .bind<ProgressBar>(TYPES.ChapterProgressBar)
    .toConstantValue(CHAPTER_PROGRESS_BAR);

  container
    .bind<DownloadService>(TYPES.DownloadService)
    .to(DownloadService)
    .inSingletonScope();

  container
    .bind<PreparationService>(TYPES.PreparationService)
    .to(PreparationService)
    .inSingletonScope();

  container
    .bind<ErrorHandler>(TYPES.ErrorHandler)
    .to(ErrorHandler)
    .inSingletonScope();

  container.bind<LogFile>(TYPES.LogFile).to(LogFile).inSingletonScope();

  container
    .bind<ModeFactory>(TYPES.ModeFactory)
    .to(ModeFactory)
    .inSingletonScope();

  container.bind<ModeFactoryFn>(TYPES.ModeFactoryFn).toFactory(() => {
    return (shouldRetryFailedDownloads: boolean) => {
      if (shouldRetryFailedDownloads) {
        container
          .bind<Mode>(TYPES.Mode)
          .to(FailedDownloadsMode)
          .inSingletonScope();
      } else {
        container.bind<Mode>(TYPES.Mode).to(DefaultMode).inSingletonScope();
      }

      return container.get<Mode>(TYPES.Mode);
    };
  });

  return container;
}

const container = setupContainer();

export default container;
