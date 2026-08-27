type WatcherCallback<T extends object> = (
  key: keyof T,
  /** `undefined` when the key was deleted. */
  value: T[keyof T] | undefined,
  previous: T[keyof T] | undefined
) => void;

const watcher = <T extends object>(
  target: T,
  onChange: WatcherCallback<T>
): T => {
  return new Proxy(target, {
    set(obj, prop, value) {
      const key = prop as keyof T;
      const existed = Object.prototype.hasOwnProperty.call(obj, key);
      const previous = obj[key];

      // The existence check matters: without it, assigning `undefined` to a key that does not exist
      // yet compared equal to its own absent value, so the…
      if (existed && Object.is(previous, value)) return true;

      const applied = Reflect.set(obj, prop, value);
      if (applied) onChange(key, value as T[keyof T], previous);
      return applied;
    },

    deleteProperty(obj, prop) {
      const key = prop as keyof T;
      if (!Object.prototype.hasOwnProperty.call(obj, key)) return true;

      const previous = obj[key];
      const applied = Reflect.deleteProperty(obj, prop);
      // A change observer that stays silent on `delete` is not observing the object, only half of
      // it.
      if (applied) onChange(key, undefined, previous);
      return applied;
    },
  });
};

export type { WatcherCallback };
export default watcher;
