import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  getDroidConfigPath,
  readDroidConfig,
  writeDroidConfigAtomic,
  type DroidConfig,
} from '../../../src/tools/adapters/droid-config';

describe('droid-config atomic writes', () => {
  let originalCcsHome: string | undefined;
  let tempHome = '';

  beforeEach(() => {
    originalCcsHome = process.env.CCS_HOME;
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-droid-config-'));
    process.env.CCS_HOME = tempHome;
  });

  afterEach(() => {
    if (originalCcsHome === undefined) {
      delete process.env.CCS_HOME;
    } else {
      process.env.CCS_HOME = originalCcsHome;
    }
    if (tempHome) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('handles concurrent writes without temp-file collisions', async () => {
    const writes: Promise<void>[] = [];
    const profiles = Array.from({ length: 12 }, (_, index) => `profile-${index}`);

    for (const profile of profiles) {
      const config: DroidConfig = {
        profile,
        endpoint: `https://${profile}.example.com`,
        apiKey: `key-${profile}`,
        updatedAt: new Date().toISOString(),
      };
      writes.push(writeDroidConfigAtomic(config));
    }

    await Promise.all(writes);

    const finalConfig = await readDroidConfig();
    expect(profiles).toContain(finalConfig.profile);
    expect(finalConfig.endpoint).toContain(finalConfig.profile);

    const configDir = path.dirname(getDroidConfigPath());
    const leftoverTempFiles = fs
      .readdirSync(configDir)
      .filter((name) => name.includes('.tmp.') && name.startsWith('config.json'));
    expect(leftoverTempFiles).toHaveLength(0);
  });
});
