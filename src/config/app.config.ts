import { SOURCE_MAP, SUPPORTED_ORIGINS } from "./constants";

const CONFIG = {
  SOURCE_MAP,
  SUPPORTED_ORIGINS,
  EXECUTABLE_PATH: process.env.EXECUTABLE_PATH ?? undefined,
};

export default CONFIG;
