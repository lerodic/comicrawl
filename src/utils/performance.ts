import os from "os";
import pLimit from "p-limit";

function getConcurrencyLevel(): number {
  const totalMemoryInGb = os.totalmem() / Math.pow(1024, 3);

  if (totalMemoryInGb >= 16) {
    return 5;
  } else if (totalMemoryInGb >= 8) {
    return 2;
  } else {
    return 1;
  }
}

export async function limit<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const limit = pLimit(getConcurrencyLevel());

  return Promise.all(tasks.map((task) => limit(task)));
}
