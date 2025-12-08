import { SOURCES, SUPPORTED_ORIGINS } from "./constants";

const CONFIG = {
  SOURCES,
  SUPPORTED_ORIGINS,
  EXECUTABLE_PATH: process.env.EXECUTABLE_PATH ?? undefined,
};

export default CONFIG;
