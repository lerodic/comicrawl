class LogFileCorrupted extends Error {
  constructor() {
    super("Log file corrupted. Delete 'log.json' and try again.");
  }
}

export default LogFileCorrupted;
