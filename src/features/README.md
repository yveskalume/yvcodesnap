# Features Layer

This layer contains user-intent modules (actions and workflows), for example:

- create snap
- export snap
- manage layers
- keyboard shortcuts

Each feature folder should expose:

- UI entry points (if needed)
- local hooks/services
- explicit public API in `index.ts`
