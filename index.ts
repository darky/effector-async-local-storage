import { clearNode, Effect, Event, is, Store, Unit } from "effector";
import { als } from "ts-fp-di";

export const diEffector =
  ({
    onCreateEvent,
    onCreateEffect,
    onCreateStore,
  }: {
    onCreateEvent: (event: Event<any>) => void;
    onCreateEffect: (effect: Effect<any, any, any>) => void;
    onCreateStore: (store: Store<any>) => void;
  }) =>
  <T extends (this: U, ...args: any) => any, U>(cb: T) => {
    return function (this: U, ...args: Parameters<T>): ReturnType<T> {
      type AlsStore = { effector: Map<typeof cb, ReturnType<T>> };

      const store = storeOrError();
      if (!store.effector) {
        store.effector = new Map();
      }

      const cachedUnit = (store as unknown as AlsStore).effector.get(cb);
      if (cachedUnit != null) {
        return cachedUnit;
      }

      const unit = cb.apply(this, args);
      (store as unknown as AlsStore).effector.set(cb, unit);

      if (is.event(unit)) {
        onCreateEvent(unit);
      } else if (is.effect(unit)) {
        onCreateEffect(unit);
      } else if (is.store(unit)) {
        onCreateStore(unit);
      }

      return unit;
    };
  };

export const diEffectorClean = () => {
  const store = storeOrError();

  (store.effector as Map<unknown, unknown> | void)?.forEach((u) => {
    if (is.unit(u)) {
      clearNode(u, { deep: true });
    }
  });
};

export const diEffectorExpose = () => {
  const store = storeOrError();

  return Array.from((store.effector as Map<unknown, Unit<any>>)?.values() ?? [])
}

const storeOrError = () => {
  const store = als.getStore();

  if (store == null) {
    throw new Error('DI container not registered! Consider, that you call "diInit" before');
  }

  return store;
};
