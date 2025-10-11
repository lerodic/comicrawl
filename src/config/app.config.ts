import { DOMAIN_MAP, SUPPORTED_DOMAINS } from "./constants";

const CONFIG = {
  DOMAIN_MAP,
  SUPPORTED_DOMAINS,
  EXECUTABLE_PATH: process.env.EXECUTABLE_PATH ?? undefined,
};

export default CONFIG;
