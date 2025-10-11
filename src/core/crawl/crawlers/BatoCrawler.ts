import { Crawler } from "../../../types";

class BatoCrawler implements Crawler {
  async extractTitle(url: string): Promise<string> {
    return "";
  }
}

export default BatoCrawler;
