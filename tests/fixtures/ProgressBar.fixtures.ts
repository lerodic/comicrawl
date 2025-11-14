import chalk from "chalk";

export const initFixtures = {
  withoutLineDelta: {
    withPrecedingEmptyLines: [
      {
        color: chalk.greenBright,
        title: "Bar 1",
        itemsTotal: 20,
        numEmptyLines: 1,
        emptyLines: "\n",
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
      },
      {
        color: chalk.greenBright,
        title: "Bar 2",
        itemsTotal: 268,
        numEmptyLines: 3,
        emptyLines: "\n\n\n",
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
      },
    ],
    withoutPrecedingEmptyLines: [
      {
        color: chalk.greenBright,
        title: "Bar 1",
        itemsTotal: 20,
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
      },
      {
        color: chalk.greenBright,
        title: "Bar 2",
        itemsTotal: 268,
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
      },
    ],
  },
  withLineDelta: {
    withPrecedingEmptyLines: [
      {
        color: chalk.greenBright,
        title: "Bar 1",
        lineDelta: 1,
        itemsTotal: 20,
        numEmptyLines: 1,
        emptyLines: "\n",
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
      },
      {
        color: chalk.greenBright,
        title: "Bar 2",
        lineDelta: 2,
        itemsTotal: 268,
        numEmptyLines: 3,
        emptyLines: "\n\n\n",
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
      },
    ],
    withoutPrecedingEmptyLines: [
      {
        color: chalk.greenBright,
        title: "Bar 1",
        lineDelta: 1,
        itemsTotal: 20,
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 1 (0/20)",
      },
      {
        color: chalk.greenBright,
        title: "Bar 2",
        lineDelta: 2,
        itemsTotal: 268,
        formattedBar: "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% | Bar 2 (0/268)",
      },
    ],
  },
};

export const advanceFixtures = {
  withoutLineDelta: [
    {
      color: chalk.greenBright,
      title: "Bar 1",
      itemsTotal: 20,
      initial: 4,
      expected: 5,
      formattedBar: "███████░░░░░░░░░░░░░░░░░░░░░░░ 25% | Bar 1 (5/20)",
    },
    {
      color: chalk.greenBright,
      title: "Bar 2",
      itemsTotal: 450,
      initial: 359,
      expected: 360,
      formattedBar: "████████████████████████░░░░░░ 80% | Bar 2 (360/450)",
    },
  ],
  withLineDelta: [
    {
      color: chalk.greenBright,
      title: "Bar 1",
      lineDelta: 1,
      itemsTotal: 20,
      initial: 4,
      expected: 5,
      formattedBar: "███████░░░░░░░░░░░░░░░░░░░░░░░ 25% | Bar 1 (5/20)",
    },
    {
      color: chalk.greenBright,
      title: "Bar 2",
      lineDelta: 2,
      itemsTotal: 450,
      initial: 359,
      expected: 360,
      formattedBar: "████████████████████████░░░░░░ 80% | Bar 2 (360/450)",
    },
  ],
};

export const completeFixtures = {
  withoutLineDelta: [
    {
      color: chalk.greenBright,
      title: "Bar 1",
      itemsTotal: 20,
      initial: 4,
      formattedBar: "██████████████████████████████ 100% | Bar 1 (20/20)",
    },
    {
      color: chalk.greenBright,
      title: "Bar 2",
      itemsTotal: 450,
      initial: 359,
      formattedBar: "██████████████████████████████ 100% | Bar 2 (450/450)",
    },
  ],
  withLineDelta: [
    {
      color: chalk.greenBright,
      title: "Bar 1",
      lineDelta: 1,
      itemsTotal: 20,
      initial: 4,
      formattedBar: "██████████████████████████████ 100% | Bar 1 (20/20)",
    },
    {
      color: chalk.greenBright,
      title: "Bar 2",
      lineDelta: 2,
      itemsTotal: 450,
      initial: 359,
      formattedBar: "██████████████████████████████ 100% | Bar 2 (450/450)",
    },
  ],
};
