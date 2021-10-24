# ts-fp-di-effector

[Effector](https://effector.dev/) Domain based on [ts-fp-di](https://github.com/darky/ts-fp-di)

## Get started

Please read first about [ts-fp-di](https://github.com/darky/ts-fp-di)

**ts-fp-di-effector** is alternative for **Effector** _Domain_, but based on Node.js AsyncLocalStorage

## Example

```ts
// On each lifecycle (HTTP request, MQ message, e.t.c.) need init DI container. More info on ts-fp-di doc
diInit(() => {
  const diEff = diEffector({
    onCreateEvent: (label, event) => {
      // catch created event here and it label. Good for logging purpose.
    },
    onCreateEffect: (label, effect) => {
      // catch created effect here and it label. Good for logging purpose.
    },
    onCreateStore: (label, store) => {
      // catch created store here and it label. Good for logging purpose.
    },
  });

  // Feel free to wrap any created Events, Effects or Stores by `diEff` factory
  // It will guarantee, that created Events, Effects or Stores will be Singleton for our DI scope

  // Some examples

  // Event factory, which will create Singleton Event instance for our DI scope
  const incEventFactory = diEff("incEvent", () => createEvent());
  // Store factory, which will create Singleton Store instance for our DI scope
  const incStoreFactory = diEff("incStore", () => createStore(0).on(incEventFactory(), (n) => n + 1));

  // Get all registered Events, Effects and Stores from DI container. Useful for debugging
  diEffectorExpose();

  // Cleanup. Need call at the end (before HTTP response, before ack MQ message, e.t.c.)
  diEffectorClean();
});
```
