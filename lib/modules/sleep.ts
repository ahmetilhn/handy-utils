const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export default sleep;
