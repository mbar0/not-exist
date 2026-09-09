# not-exist

Check whether packages do not exist in an npm-compatible registry.

## Install

```sh
npm install not-exist
```

## API

```js
import { notExist } from "not-exist";

await notExist("express");   // false
await notExist("not-exist"); // false
```

By default, `notExist` queries `npm_config_registry` when it is set and otherwise
uses the public npm registry. You can provide a different registry, request
headers, or an abort signal:

```js
await notExist("example", {
  registry: "https://registry.example.com",
  signal: AbortSignal.timeout(5_000),
  headers: { authorization: "Bearer token" }
});
```

The function returns `true` only when the registry responds with HTTP 404. It
returns `false` for a successful response and throws for authentication errors,
rate limits, server failures, invalid names, and network failures.

## CLI

```sh
npx not-exist express some-package-name
npx not-exist --json express some-package-name
```

The CLI exits with status 0 if every package is absent, 1 if any package exists,
and 2 if the check fails.

## Caveat

A registry 404 means that the package is not currently visible in that registry.
It does not guarantee that the name can be published; registry policy and a
concurrent publication can still prevent that.

## License

MIT
