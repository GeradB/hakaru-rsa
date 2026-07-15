import { getMergedFragment, saveFragment } from '../cmsService.js';

/** @typedef {'project'|'project_past'|'committee'|'announcement'|'event'} CmsSection */

export const SECTION_META = Object.freeze({
  project: {
    slug: 'projects',
    label: 'Projects',
    pagePath: '/projects',
    arrayPath: ['projectsPage', 'items'],
    idField: 'id',
    matchFields: ['id', 'title'],
  },
  project_past: {
    slug: 'projects',
    label: 'Past initiatives',
    pagePath: '/projects',
    arrayPath: ['projectsPage', 'pastInitiatives'],
    idField: null,
    matchFields: ['title'],
  },
  committee: {
    slug: 'committee',
    label: 'Committee',
    pagePath: '/committee',
    arrayPath: ['committeePage', 'members'],
    idField: null,
    matchFields: ['name', 'role'],
  },
  announcement: {
    slug: 'home',
    label: 'Announcements',
    pagePath: '/',
    arrayPath: ['announcements', 'items'],
    idField: 'id',
    matchFields: ['id', 'title'],
  },
  event: {
    slug: 'home',
    label: "What's On",
    pagePath: '/events',
    arrayPath: ['upcomingEvents', 'events'],
    idField: 'id',
    matchFields: ['id', 'title'],
  },
});

function cloneJson(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function getAtPath(obj, path) {
  let cur = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

function setAtPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (cur[key] == null || typeof cur[key] !== 'object') {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
}

export function nextNumericId(items) {
  const ids = (items || [])
    .map((x) => Number(x?.id))
    .filter((n) => Number.isFinite(n));
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function normalizeMatch(s) {
  return String(s || '')
    .trim()
    .toLowerCase();
}

function findItemIndex(items, match, matchFields) {
  if (!items?.length) return -1;
  const id = match?.id != null ? Number(match.id) : null;
  const title = match?.title != null ? normalizeMatch(match.title) : null;
  const name = match?.name != null ? normalizeMatch(match.name) : null;
  const role = match?.role != null ? normalizeMatch(match.role) : null;

  return items.findIndex((item) => {
    if (id != null && Number.isFinite(id) && Number(item.id) === id) return true;
    if (title && normalizeMatch(item.title) === title) return true;
    if (name && normalizeMatch(item.name) === name) return true;
    if (name && title && normalizeMatch(item.name) === title) return true;
    if (role && normalizeMatch(item.role) === role) return true;
    if (title && item.title && normalizeMatch(item.title).includes(title)) return true;
    if (name && item.name && normalizeMatch(item.name).includes(name)) return true;
    return false;
  });
}

function buildProjectItem(fields, imageUrl) {
  const status = ['annual', 'ongoing', 'planning'].includes(fields.status)
    ? fields.status
    : 'ongoing';
  return {
    id: fields.id,
    title: String(fields.title || '').trim(),
    description: String(fields.description || '').trim(),
    status,
    emoji: String(fields.emoji || '📌').trim() || '📌',
    imageUrl: imageUrl || fields.imageUrl || '',
  };
}

function buildAnnouncementItem(fields) {
  return {
    id: fields.id,
    emoji: String(fields.emoji || '📢').trim() || '📢',
    title: String(fields.title || '').trim(),
    content: String(fields.content || fields.description || '').trim(),
  };
}

function buildEventItem(fields) {
  return {
    id: fields.id,
    title: String(fields.title || '').trim(),
    date: String(fields.date || '').trim(),
    time: String(fields.time || '').trim(),
    description: String(fields.description || '').trim(),
  };
}

function buildCommitteeMember(fields, imageUrl) {
  return {
    name: String(fields.name || '').trim(),
    role: String(fields.role || '').trim(),
    bio: String(fields.bio || fields.description || '').trim(),
    imageUrl: imageUrl || fields.imageUrl || '',
  };
}

function buildPastInitiative(fields) {
  return {
    title: String(fields.title || '').trim(),
    description: String(fields.description || '').trim(),
  };
}

function summarizeItem(section, item) {
  if (!item) return '';
  if (section === 'committee') return `${item.name} (${item.role})`;
  return item.title || item.name || 'item';
}

/**
 * @param {object} params
 * @param {CmsSection} params.section
 * @param {'add'|'update'|'delete'} params.action
 * @param {object} [params.match]
 * @param {object} [params.fields]
 * @param {string} [params.imageUrl]
 */
export async function applyCmsAction({ section, action, match = {}, fields = {}, imageUrl }) {
  const meta = SECTION_META[section];
  if (!meta) {
    throw new Error(`Unknown section: ${section}`);
  }
  if (!['add', 'update', 'delete'].includes(action)) {
    throw new Error(`Unknown action: ${action}`);
  }

  const fragment = cloneJson(await getMergedFragment(meta.slug));
  const items = cloneJson(getAtPath(fragment, meta.arrayPath)) || [];
  if (!Array.isArray(items)) {
    throw new Error('Content section is not an array');
  }

  let resultItem = null;
  let resultIndex = -1;

  if (action === 'add') {
    if (section === 'project') {
      const id = nextNumericId(items);
      resultItem = buildProjectItem({ ...fields, id }, imageUrl);
      items.push(resultItem);
    } else if (section === 'project_past') {
      resultItem = buildPastInitiative(fields);
      if (!resultItem.title) throw new Error('Past initiative requires a title');
      items.push(resultItem);
    } else if (section === 'committee') {
      resultItem = buildCommitteeMember(fields, imageUrl);
      if (!resultItem.name) throw new Error('Committee member requires a name');
      items.push(resultItem);
    } else if (section === 'announcement') {
      const id = nextNumericId(items);
      resultItem = buildAnnouncementItem({ ...fields, id });
      if (!resultItem.title) throw new Error('Announcement requires a title');
      items.push(resultItem);
    } else if (section === 'event') {
      const id = nextNumericId(items);
      resultItem = buildEventItem({ ...fields, id });
      if (!resultItem.title) throw new Error('Event requires a title');
      items.push(resultItem);
    }
    resultIndex = items.length - 1;
  } else {
    resultIndex = findItemIndex(items, match, meta.matchFields);
    if (resultIndex < 0) {
      const hint = match?.title || match?.name || match?.id || 'unknown';
      throw new Error(
        `Could not find a matching ${meta.label} item for "${hint}". Try a more specific title or id.`,
      );
    }
    if (action === 'delete') {
      resultItem = items[resultIndex];
      items.splice(resultIndex, 1);
    } else {
      const existing = items[resultIndex];
      if (section === 'project') {
        resultItem = buildProjectItem(
          {
            ...existing,
            ...fields,
            id: existing.id,
          },
          imageUrl || existing.imageUrl,
        );
      } else if (section === 'project_past') {
        resultItem = buildPastInitiative({ ...existing, ...fields });
      } else if (section === 'committee') {
        resultItem = buildCommitteeMember(
          { ...existing, ...fields },
          imageUrl || existing.imageUrl,
        );
      } else if (section === 'announcement') {
        resultItem = buildAnnouncementItem({
          ...existing,
          ...fields,
          id: existing.id,
        });
      } else if (section === 'event') {
        resultItem = buildEventItem({ ...existing, ...fields, id: existing.id });
      }
      items[resultIndex] = resultItem;
    }
  }

  setAtPath(fragment, meta.arrayPath, items);
  await saveFragment(meta.slug, fragment);

  return {
    section,
    action,
    slug: meta.slug,
    label: meta.label,
    pagePath: meta.pagePath,
    item: resultItem,
    summary: summarizeItem(section, resultItem),
    index: resultIndex,
  };
}

/** Compact list for LLM context */
export async function listSectionItems(section) {
  const meta = SECTION_META[section];
  if (!meta) return [];
  const fragment = await getMergedFragment(meta.slug);
  const items = getAtPath(fragment, meta.arrayPath) || [];
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (section === 'committee') {
      return { index, name: item.name, role: item.role };
    }
    if (section === 'project_past') {
      return { index, title: item.title };
    }
    return { index, id: item.id, title: item.title };
  });
}

export async function listAllAgentSections() {
  const sections = Object.keys(SECTION_META);
  const out = {};
  for (const section of sections) {
    out[section] = await listSectionItems(section);
  }
  return out;
}
