# Comicrawl

**Comicrawl** is a versatile comic book and manga downloader.

> [!WARNING]
> Most manga websites aren’t exactly safe for work.

## Features

- **Multi-source support**
  - weebcentral.com
  - bato.to
  - xbato.com
- **Flexible download modes**
  - Download **all chapters**
  - Download **starting at a specific chapter**
  - Download **a chapter range**
  - **Manually pick** chapters to download
- **Automatic error tracking & retries**
  - All failed downloads are tracked in a dedicated log file
  - On the next run, Comicrawl detects this log and allows you to retry downloading all failed images

## How to use it

1. Clone the repo

```bash
git clone git@github.com:lerodic/comicrawl.git
```

2. Install dependencies

```bash
cd comicrawl
npm install
```

You can now build and run the project.  
Alternatively, you can skip the build step and run it directly.

```bash
# build and run
npm run build && npm run start

# run directly
npm run dev
```

## Supporting additional sources

To add support for a new source, all you need to do is to add a new concrete implementation of the `Crawler` interface shown below:

```ts
interface Crawler {
  extractTitle(url: string): Promise<string>;
  extractChapters(url: string): Promise<Chapter[]>;
  extractImageLinks(url: string): Promise<string[]>;
  terminate(): Promise<void>;
}
```

Crawlers reside in `src/crawl/crawlers` and need to be registered for automatic dependency resolution. You can do so in just two simple steps.

1. You need to expand the `SupportedSource` type in `src/types.d.ts`:

```ts
// types.d.ts

export type SupportedSource = "Bato" | "WeebCentral" | "NewSource";
```

2. You need to map any and all origins that you want to associate with your new crawler to that very crawler.  
   You can do that by expanding the `SOURCE_MAP` constant located in `src/config/constants.ts` by adding a new key/value pair to `sourceMap` as outlined below.

```ts
// constants.ts

function createSourceMap(): SourceMap {
  const sourceMap = new Map<SupportedSource, SourceInfo>();

  sourceMap.set("Bato", {
    origins: ["https://bato.to", "https://xbato.com"],
    class: BatoCrawler,
  });

  sourceMap.set("WeebCentral", {
    origins: ["https://weebcentral.com"],
    class: WeebCentralCrawler,
  });

  // add a mapping for the new source
  sourceMap.set("NewSource", {
    origins: ["https://newsource.com"],
    class: NewSourceCrawler,
  });

  return domainMap;
}
```

## Creating comic book archives

Comicrawl creates a folder for each new comic/manga inside of `/comics`.  
It then creates an additional folder for each chapter, and stores all of that chapter’s images inside of it.  
You still need to manually add individual chapter folders to a `.cbz` or `.cbr` archive to allow common comic/manga readers to open them.
