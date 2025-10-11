class EmptyGraphicNovel extends Error {
  constructor(title: string) {
    super(`${title} is empty. Aborting.`);
  }
}

export default EmptyGraphicNovel;
