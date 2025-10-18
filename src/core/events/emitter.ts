import mitt from "mitt";
import type { ComicrawlEvents } from "../../types";

const emitter = mitt<ComicrawlEvents>();

export default emitter;
