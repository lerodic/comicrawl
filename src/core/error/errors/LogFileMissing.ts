class LogFileMissing extends Error {
  constructor() {
    super("Could not find log file.");
  }
}

export default LogFileMissing;
