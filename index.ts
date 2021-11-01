import { Effect, Event, is, Store, Unit } from 'effector';
import { als } from 'ts-fp-di';

const depsMap = new Map<() => Unit<any>, (() => Unit<any>)[]>();

export const diEffector =
  ({
    onCreateEvent,
    onCreateEffect,
    onCreateStore,
  }: {
    onCreateEvent: (label: string, event: Event<any>) => void;
    onCreateEffect: (label: string, effect: Effect<any, any, any>) => void;
    onCreateStore: (label: string, store: Store<any>) => void;
  }) =>
  <T extends (this: U, ...args: any) => any, U>(
    label: string,
    cb: T,
    autoInitDeps: (...args: any) => (() => Unit<any>)[] = () => []
  ) => {
    const resp = function (this: U, ...args: Parameters<T>): ReturnType<T> {
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
      unit.sid = label;
      (store as unknown as AlsStore).effector.set(cb, unit);

      (depsMap.get(resp) ?? []).forEach((dep) => dep());

      if (is.event(unit)) {
        onCreateEvent(label, unit);
      } else if (is.effect(unit)) {
        onCreateEffect(label, unit);
      } else if (is.store(unit)) {
        onCreateStore(label, unit);
      }

      return unit;
    };

    autoInitDeps().forEach((unitFactory) => {
      const deps = depsMap.get(unitFactory) ?? [];
      depsMap.set(unitFactory, deps.concat(resp));
    });

    return resp;
  };

const storeOrError = () => {
  const store = als.getStore();

  if (store == null) {
    throw new Error('DI container not registered! Consider, that you call "diInit" before');
  }

  return store;
};
