import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

// Local executable adapter. Native Xano must supply an equivalent database transaction + unique attempt key.
export class LocalRepository {
  constructor(file = null) { this.file = file; this.state = { orders: [], sessions: {}, accounting: [] }; this.queue = Promise.resolve(); }
  async init() {
    if (this.file) { try { this.state = JSON.parse(await readFile(this.file, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
    return this;
  }
  async locked(fn) {
    const run = this.queue.then(async () => {
      try { return await fn(this.state); }
      finally {
        if (this.file) {
          await mkdir(path.dirname(this.file), { recursive: true });
          const temporary = `${this.file}.tmp`;
          await writeFile(temporary, JSON.stringify(this.state), { mode: 0o600 });
          await rename(temporary, this.file);
        }
      }
    });
    this.queue = run.catch(() => {});
    return run;
  }
}
