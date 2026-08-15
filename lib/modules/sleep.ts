const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => {
    // The arrow discards setTimeout's arguments so the promise resolves with
    // undefined; passing `resolve` directly made this a Promise<unknown>.
    setTimeout(() => resolve(), time);
  });
};

export default sleep;
