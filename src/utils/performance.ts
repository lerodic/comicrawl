import os from "os";
import pLimit from "p-limit";

const memoryConsumerMapping = {
  8: 1,
  16: 2,
  32: 5,
  64: 10,
  128: 15,
};

function getConcurrencyLevel(): number {
  const totalMemory = os.totalmem();
  const totalMemoryInGb = totalMemory / Math.pow(1024, 3);

  for (const [memory, consumers] of Object.entries(memoryConsumerMapping)) {
    if (totalMemoryInGb >= +memory) {
      continue;
    }

    return consumers;
  }

  return 20;
}

export async function limit<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const limit = pLimit(getConcurrencyLevel());

  return Promise.all(tasks.map((task) => limit(task)));
}
