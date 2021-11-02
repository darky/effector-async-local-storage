import { createEffect, createEvent, createStore, Effect, Event, is, Store } from 'effector';
import { test } from 'uvu';
import { equal, throws } from 'uvu/assert';

import { effectorAsyncLocalStorageFactory, effectorAsyncLocalStorageInit } from './index.js';

test('diEffector onCreateEvent', () => {
  effectorAsyncLocalStorageInit(() => {
    let event!: Event<any>;
    let label = '';

    const diEff = effectorAsyncLocalStorageFactory({
      onCreateEvent: (lbl, ev) => {
        label = lbl;
        event = ev;
      },
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    const getEvent = diEff('event', () => createEvent());
    const ev = getEvent();
    equal(is.event(ev), true);
    equal(event, ev);
    equal(event.sid, 'event');
    equal(label, 'event');
  });
});

test('diEffector onCreateEffect', () => {
  effectorAsyncLocalStorageInit(() => {
    let effectFx!: Effect<any, any, any>;
    let label = '';

    const diEff = effectorAsyncLocalStorageFactory({
      onCreateEvent: () => {},
      onCreateEffect: (lbl, eff) => {
        label = lbl;
        effectFx = eff;
      },
      onCreateStore: () => {},
    });

    const getEffect = diEff('effect', () => createEffect());
    const effFx = getEffect();
    equal(is.effect(effFx), true);
    equal(effectFx, effFx);
    equal(effectFx.sid, 'effect');
    equal(label, 'effect');
  });
});

test('diEffector onCreateStore', () => {
  effectorAsyncLocalStorageInit(() => {
    let $store!: Store<any>;
    let label = '';

    const diEff = effectorAsyncLocalStorageFactory({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: (lbl, s) => {
        label = lbl;
        $store = s;
      },
    });

    const getStore = diEff('store', () => createStore(null));
    const $s = getStore();
    equal(is.store($s), true);
    equal($store, $s);
    equal($store.sid, 'store');
    equal(label, 'store');
  });
});

test('diEffector error without diInit', () => {
  const diEff = effectorAsyncLocalStorageFactory({
    onCreateEvent: () => {},
    onCreateEffect: () => {},
    onCreateStore: () => {},
  });

  throws(() => diEff('', () => createStore(null))());
});

test('diEffector cache', () => {
  const diEff = effectorAsyncLocalStorageFactory({
    onCreateEvent: () => {},
    onCreateEffect: () => {},
    onCreateStore: () => {},
  });

  effectorAsyncLocalStorageInit(() => {
    let i = 0;

    const getStore = diEff('', () => {
      i++;
      return createStore(null);
    });

    const $store1 = getStore();
    const $store2 = getStore();
    equal($store1, $store2);
    equal(i, 1);
  });
});

test('diEffector params typing', () => {
  effectorAsyncLocalStorageInit(() => {
    const diEff = effectorAsyncLocalStorageFactory({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    const getStore = diEff('', (n: number) => createStore(n));

    equal(getStore(1).getState(), 1);
  });
});

test.run();
