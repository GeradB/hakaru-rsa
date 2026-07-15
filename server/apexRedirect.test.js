import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSafeWwwRedirect } from './apexRedirect.js';

const ORIGIN = 'https://www.hakarursa.co.nz';

describe('buildSafeWwwRedirect', () => {
  it('maps normal paths to www', () => {
    assert.equal(buildSafeWwwRedirect(ORIGIN, '/'), `${ORIGIN}/`);
    assert.equal(buildSafeWwwRedirect(ORIGIN, '/contact'), `${ORIGIN}/contact`);
    assert.equal(
      buildSafeWwwRedirect(ORIGIN, '/membership?x=1'),
      `${ORIGIN}/membership?x=1`,
    );
  });

  it('rejects protocol-relative open redirects', () => {
    assert.equal(buildSafeWwwRedirect(ORIGIN, '//evil.example/phish'), `${ORIGIN}/`);
    assert.equal(buildSafeWwwRedirect(ORIGIN, '///evil.example'), `${ORIGIN}/`);
  });

  it('rejects backslash and absolute URLs', () => {
    assert.equal(buildSafeWwwRedirect(ORIGIN, '/\\evil.example'), `${ORIGIN}/`);
    assert.equal(buildSafeWwwRedirect(ORIGIN, 'https://evil.example'), `${ORIGIN}/`);
  });
});
