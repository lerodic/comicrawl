class LogFileCreationFailed extends Error {
  constructor() {
    super(
      "Failed to create log file. Run Comicrawl again with elevated privileges."
    );
  }
}

export default LogFileCreationFailed;
