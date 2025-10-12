class CrawlerInitializationFailed extends Error {
  constructor() {
    super("Failed to initialize crawler. Please try again.\n");
  }
}

export default CrawlerInitializationFailed;
