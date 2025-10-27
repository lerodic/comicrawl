class CrawlerInitializationFailed extends Error {
  constructor() {
    super("Failed to initialize crawler. Please try again.");
  }
}

export default CrawlerInitializationFailed;
