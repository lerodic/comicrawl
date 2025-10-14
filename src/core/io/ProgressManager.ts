import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import ProgressBar from "./ProgressBar";
import TYPES from "../../config/inversify/inversify.types";

@boundClass
@injectable()
class ProgressManager {
  constructor(
    @inject(TYPES.PreparationProgressBar)
    private preparationProgressBar: ProgressBar
  ) {}

  createPreparationBar(title: string, itemsTotal: number) {
    this.preparationProgressBar.init(title, itemsTotal, 2);
  }

  advancePreparation() {
    this.preparationProgressBar.advance();
  }

  completePreparation() {
    this.preparationProgressBar.complete();
  }
}

export default ProgressManager;
