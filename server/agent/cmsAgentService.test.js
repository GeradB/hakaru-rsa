import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nextNumericId, SECTION_META } from './cmsAgentService.js';
import { deepMerge } from '../cmsMerge.js';

describe('nextNumericId', () => {
  it('returns 1 for empty list', () => {
    assert.equal(nextNumericId([]), 1);
  });

  it('returns max id + 1', () => {
    assert.equal(nextNumericId([{ id: 1 }, { id: 5 }, { id: 3 }]), 6);
  });
});

describe('array replace merge behavior', () => {
  it('replaces entire items array when patch includes items', () => {
    const defaults = {
      projectsPage: {
        items: [
          { id: 1, title: 'A' },
          { id: 2, title: 'B' },
        ],
      },
    };
    const patch = {
      projectsPage: {
        items: [{ id: 1, title: 'A' }, { id: 2, title: 'B' }, { id: 3, title: 'C' }],
      },
    };
    const merged = deepMerge(defaults, patch);
    assert.equal(merged.projectsPage.items.length, 3);
    assert.equal(merged.projectsPage.items[2].title, 'C');
  });

  it('preserves sibling keys when patching nested object without arrays', () => {
    const defaults = {
      announcements: { title: 'News', subtitle: 'Sub', items: [{ id: 1 }] },
    };
    const patch = {
      announcements: { title: 'Updated' },
    };
    const merged = deepMerge(defaults, patch);
    assert.equal(merged.announcements.title, 'Updated');
    assert.equal(merged.announcements.subtitle, 'Sub');
    assert.equal(merged.announcements.items.length, 1);
  });
});

describe('SECTION_META', () => {
  it('maps agent sections to CMS slugs', () => {
    assert.equal(SECTION_META.project.slug, 'projects');
    assert.equal(SECTION_META.announcement.slug, 'home');
    assert.equal(SECTION_META.event.slug, 'home');
    assert.equal(SECTION_META.committee.slug, 'committee');
  });
});
