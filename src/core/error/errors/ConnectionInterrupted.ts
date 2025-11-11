class ConnectionInterrupted extends Error {
  constructor() {
    super("Network connection lost.");
  }
}

export default ConnectionInterrupted;
