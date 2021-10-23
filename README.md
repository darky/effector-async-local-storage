# ts-fp-di-effector
[Effector](https://effector.dev/) bindings for [ts-fp-di](https://github.com/darky/ts-fp-di)

## Get started

Please read first about [ts-fp-di](https://github.com/darky/ts-fp-di)

**ts-fp-di-effector** is alternative for **Effector** *Domain*, but based on Node.js AsyncLocalStorage

## Example

```ts
diInit(() => { // <- on each lifecycle (HTTP request, MQ message, e.t.c.) need init DI container. More info on ts-fp-di doc
  const diEff = diEffector({
    onCreateEvent: (event) => {
      // catch created event here. Good for logging purpose.
    },
    onCreateEffect: (effect) => {
      // catch created effect here. Good for logging purpose.
    },
    onCreateStore: (store) => {
      // catch created store here. Good for logging purpose.
    },
  });

  // Feel free to wrap any created Events, Effects or Stores by `diEff` factory
  // It will guarantee, that created Events, Effects or Stores will be Singleton for out DI scope

  // Some examples
  const incEventFactory = diEff(() => createEvent()); // <- Event factory, which will create Singleton Event instance for our DI scope
  const incStoreFactory = diEff(() => createStore(0)
    .on(incEventFactory(), n => n + 1)); // <- Store factory, which will create Singleton Store instance for our DI scope

  diEffectorClean() // <- Cleanup. Need call at the end (before HTTP response, before ack MQ message, e.t.c.)
});
```
