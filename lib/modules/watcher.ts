type Watcher<T extends object> = {
  proxy: T;
  onChange: (key: keyof T, value: T[keyof T], previous: T[keyof T]) => void;
};

const watcher = <T extends object>(
  target: T,
  onChange: Watcher<T>["onChange"],
): T => {
  return new Proxy(target, {
    set(obj, prop, value) {
      const key = prop as keyof T;
      const previous = obj[key];

      if (Object.is(previous, value)) return true;

      obj[key] = value;
      onChange(key, value, previous);
      return true;
    },
  });
};

export default watcher;
