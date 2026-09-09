#!/usr/bin/env node

import { notExist } from "../src/index.js";

const HELP = `Usage: not-exist [options] <package...>

Check whether packages do not exist in an npm registry.

Options:
  --registry <url>  Registry URL (defaults to npm_config_registry or npmjs.org)
  --json            Print machine-readable JSON
  -h, --help        Show this help

Exit status is 0 if every named package is absent, 1 if any exists, and 2 on error.`;

try {
  const { names, registry, json, help } = parseArgs(process.argv.slice(2));

  if (help) {
    console.log(HELP);
    process.exitCode = 0;
  } else if (names.length === 0) {
    console.error(HELP);
    process.exitCode = 2;
  } else {
    const results = await Promise.all(
      names.map(async (name) => ({ name, exists: !(await notExist(name, { registry })) }))
    );

    if (json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const result of results) {
        console.log(`${result.name} ${result.exists ? "exists" : "does not exist"}`);
      }
    }

    process.exitCode = results.some((result) => result.exists) ? 1 : 0;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}

function parseArgs(args) {
  const parsed = { names: [], registry: undefined, json: false, help: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "-h" || argument === "--help") {
      parsed.help = true;
    } else if (argument === "--json") {
      parsed.json = true;
    } else if (argument === "--registry") {
      index += 1;
      if (!args[index]) throw new TypeError("--registry requires a URL");
      parsed.registry = args[index];
    } else if (argument.startsWith("--registry=")) {
      parsed.registry = argument.slice("--registry=".length);
      if (!parsed.registry) throw new TypeError("--registry requires a URL");
    } else if (argument.startsWith("-")) {
      throw new TypeError(`unknown option: ${argument}`);
    } else {
      parsed.names.push(argument);
    }
  }

  return parsed;
}
