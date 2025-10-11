class MissingChromiumInstance extends Error {
  constructor(path: string) {
    super(`Could not find Chromium executable in '${path}'.`);
  }
}

export default MissingChromiumInstance;
