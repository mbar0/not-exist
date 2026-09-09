import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { notExist, RegistryResponseError } from "../src/index.js";

const originalFetch = globalThis.fetch;
const registry = "https://registry.example.test/npm";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function respondWith(status, statusText = "") {
  let requestedUrl;
  globalThis.fetch = async (url) => {
    requestedUrl = url;
    return new Response(null, { status, statusText });
  };
  return () => requestedUrl;
}

test("returns false when a package exists", async () => {
  respondWith(200, "OK");
  assert.equal(await notExist("present", { registry }), false);
});

test("returns true only for a missing package", async () => {
  respondWith(404, "Not Found");
  assert.equal(await notExist("missing", { registry }), true);
});

test("supports scoped package names", async () => {
  const requestedUrl = respondWith(200, "OK");
  assert.equal(await notExist("@scope/present", { registry }), false);
  assert.equal(requestedUrl().href, "https://registry.example.test/npm/%40scope%2Fpresent");
});

test("throws on registry errors", async () => {
  respondWith(503, "Service Unavailable");
  await assert.rejects(
    notExist("broken", { registry }),
    (error) => error instanceof RegistryResponseError && error.status === 503
  );
});

test("rejects invalid package names without querying", async () => {
  await assert.rejects(notExist("NOT VALID", { registry }), /invalid npm package name/);
  await assert.rejects(notExist("", { registry }), /non-empty string/);
});
