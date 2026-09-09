const DEFAULT_REGISTRY = "https://registry.npmjs.org";
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9._-]+$/;

export class RegistryResponseError extends Error {
  constructor(status, statusText, url) {
    super(`Registry returned ${status} ${statusText} for ${url}`);
    this.name = "RegistryResponseError";
    this.status = status;
    this.url = url;
  }
}

/**
 * Check whether a package is absent from an npm-compatible registry.
 *
 * @param {string} name npm package name
 * @param {{registry?: string, signal?: AbortSignal, headers?: HeadersInit}} options
 * @returns {Promise<boolean>} true only when the registry returns HTTP 404
 */
export async function notExist(name, options = {}) {
  validateName(name);

  if (options === null || typeof options !== "object") {
    throw new TypeError("options must be an object");
  }

  const registry = options.registry ?? process.env.npm_config_registry ?? DEFAULT_REGISTRY;
  const url = packageUrl(name, registry);
  const headers = new Headers(options.headers);

  if (!headers.has("accept")) {
    headers.set("accept", "application/vnd.npm.install-v1+json");
  }

  const response = await fetch(url, {
    headers,
    signal: options.signal,
    redirect: "follow"
  });

  if (response.status === 404) {
    return true;
  }

  if (response.ok) {
    return false;
  }

  throw new RegistryResponseError(response.status, response.statusText, url.href);
}

export default notExist;

function validateName(name) {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("package name must be a non-empty string");
  }

  if (name.length > 214 || !PACKAGE_NAME.test(name)) {
    throw new TypeError(`invalid npm package name: ${name}`);
  }

  if (!name.startsWith("@") && (name.startsWith(".") || name.startsWith("_"))) {
    throw new TypeError(`invalid npm package name: ${name}`);
  }
}

function packageUrl(name, registry) {
  const base = new URL(registry);
  base.pathname = `${base.pathname.replace(/\/*$/, "")}/`;
  base.search = "";
  base.hash = "";
  return new URL(encodeURIComponent(name), base);
}
