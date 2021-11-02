# effector-async-local-storage

[Effector](https://effector.dev/) Domain based on Node.js AsyncLocalStorage

## Example

```typescript
import { attach, createEffect, createEvent, createStore } from 'effector';
import { effectorAsyncLocalStorageFactory, effectorAsyncLocalStorageInit } from 'effector-async-local-storage';
import Koa from 'koa';
import Router from 'koa-router';
import Redis from 'ioredis';

const eff = effectorAsyncLocalStorageFactory({
  onCreateEffect(sid, effect) {
    effect.watch((val) => {
      console.log(`Effect "${sid}" call with value: ${val}`);
    });
    effect.doneData.watch((val) => {
      console.log(`Effect "${sid}" done with value: ${val}`);
    });
    effect.failData.watch((val) => {
      console.log(`Effect "${sid}" fail with value: ${val}`);
    });
  },
  onCreateEvent(sid, event) {
    event.watch((val) => {
      console.log(`Event "${sid}" call with value: ${val}`);
    });
  },
  onCreateStore(sid, store) {
    store.watch((state, val) => {
      console.log(`Store "${sid}" mutation with value: ${val}`);
      console.log(`Store "${sid}" mutation, current state: ${state}`);
    });
  },
});

const increment = eff('increment', () => createEvent());
const decrement = eff('decrement', () => createEvent());
const reset = eff('reset', () => createEvent());

const pullCounterFx = eff('pullCounterFx', () =>
  createEffect<void, number>(async () => {
    const count = await redis.get('counter');
    return Number(count ?? 0);
  })
);

const pushCounterFx = eff('pushCounterFx', () =>
  attach({
    source: $counter(),
    effect: createEffect<number, number>(async (count) => {
      await redis.set('counter', count);
      return count;
    }),
  })
);

const $counter = eff(
  '$counter',
  () =>
    createStore(0)
      .on(increment(), (state) => state + 1)
      .on(decrement(), (state) => state - 1)
      .on(pullCounterFx().doneData, (_, value) => value)
      .reset(reset())
);

const app = new Koa();
const router = new Router();
const redis = new Redis();

app.use(async (_, next) => {
  await effectorAsyncLocalStorageInit(async () => {
    await next();
  });
});

router.post('/increment', async (ctx) => {
  $counter();
  await pullCounterFx()();
  increment()();
  ctx.body = await pushCounterFx()();
});

router.post('/decrement', async (ctx) => {
  $counter();
  await pullCounterFx()();
  decrement()();
  ctx.body = await pushCounterFx()();
});

router.post('/reset', async (ctx) => {
  $counter();
  await pullCounterFx()();
  reset()();
  ctx.body = await pushCounterFx()();
});

app.use(router.routes());

app.listen(4000);
```

## Related

* [ts-fp-di](https://github.com/darky/ts-fp-di) - Tiny TypeScript functional dependency injection, based on Node.js AsyncLocalStorage
