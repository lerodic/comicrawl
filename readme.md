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

3. Link `comicrawl` executable

```bash
npm run build && npm link
```

4. Run the program via the `comicrawl` command

```bash
comicrawl
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

Crawlers reside in `src/core/crawl/crawlers` and need to be registered for automatic dependency resolution. You can do so in just two simple steps.

1. You need to expand the `SupportedSource` type in `src/types.d.ts`:

```ts
// types.d.ts

export type SupportedSource = "Bato" | "WeebCentral" | "NewSource";
```

2. You must link all desired origins to your new crawler.  
   You can do that by expanding the `SOURCES` constant located in `src/config/constants.ts` by adding a new entry as outlined below.

```ts
// constants.ts

export const SOURCES: Source[] = [
  {
    id: "Bato",
    origins: ["https://bato.to", "https://xbato.com"],
    class: BatoCrawler,
  },
  {
    id: "WeebCentral",
    origins: ["https://weebcentral.com"],
    class: WeebCentralCrawler,
  },
  // add new source
  {
    id: "NewSource",
    origins: ["https://newsource.com"],
    class: NewSourceCrawler,
  },
];
```

## Creating comic book archives

Comicrawl creates a folder for each new comic/manga inside of `/comics`.  
It then creates a subfolder for each chapter and stores all of that chapter’s images inside of it.  
You still need to manually add individual chapter folders to a `.cbz` or `.cbr` archive to allow common comic/manga readers to open them.
