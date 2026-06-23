#!/usr/bin/env node
// Custom JSON Server launcher.
//
// json-server v1 hardcodes `{ ...data, id: randomId() }` on create, so it
// always overrides client-provided ids with a random string. This thin
// wrapper reuses json-server's own app/router but patches `Service.create`
// so that:
//   1. a client-provided `id` is honored (kept as-is), and
//   2. when no id is sent, a sequential numeric id is generated
//      (`max(existing numeric id) + 1`, or `1` when empty).
//
// Everything else (GET / PUT / PATCH / DELETE, filtering, pagination, CORS,
// file watching) is the stock json-server v1 behavior.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';
import { Observer } from 'json-server/lib/adapters/observer.js';
import { createApp } from 'json-server/lib/app.js';
import { Service } from 'json-server/lib/service.js';

const file = process.argv[2] ?? 'db.json';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? 'localhost';

if (!existsSync(file)) {
  console.error(`File ${file} not found`);
  process.exit(1);
}
if (readFileSync(file, 'utf-8').trim() === '') {
  writeFileSync(file, '{}');
}

// Set up the same lowdb stack json-server's CLI uses.
const adapter = new JSONFile(file);
const observer = new Observer(new NormalizedAdapter(adapter));
const db = new Low(observer, {});
await db.read();

/** Next sequential id: max(numeric id) + 1, or 1 when there are none. */
function nextNumericId(items) {
  const numericIds = items
    .map((item) => Number(item.id))
    .filter((n) => Number.isInteger(n) && n > 0);
  const max = numericIds.length ? Math.max(...numericIds) : 0;
  return String(max + 1);
}

// Patch create to honor client ids and otherwise assign sequential numeric ids.
Service.prototype.create = async function create(name, data = {}) {
  const items = db.data[name];
  if (!Array.isArray(items)) return undefined;

  const provided = data.id;
  const hasProvidedId = provided !== undefined && provided !== null && `${provided}`.trim() !== '';
  const id = hasProvidedId ? `${provided}` : nextNumericId(items);

  const item = { ...data, id };
  items.push(item);
  await db.write();
  return item;
};

const app = createApp(db, { logger: false });

app.listen(port, () => {
  console.log(`JSON Server (custom id-aware) running on http://${host}:${port}`);
  console.log(`Watching ${file} ...`);
  console.log(`Endpoints: http://${host}:${port}/courses`);
});
