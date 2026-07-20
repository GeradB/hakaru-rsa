const SITE = 'Hakaru RSA';

const DEFAULT_DESCRIPTION =
  'Hakaru & Districts Returned and Services Association — supporting veterans, service members, and families in North Waikato. Membership, events, and community.';

/** @typedef {{ title: string, description: string }} PageSeo */

/** @type {Record<string, PageSeo>} */
const BY_PATH = {
  '/': {
    title: SITE,
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: `About | ${SITE}`,
    description:
      'Learn about Hakaru RSA, our history, and how we support veterans and the wider community in the Hakaru district.',
  },
  '/membership': {
    title: `Membership | ${SITE}`,
    description:
      'RSA membership types, fees, and benefits at Hakaru & Districts RSA. Join our community and support local veterans.',
  },
  '/membership/become': {
    title: `Become a Member | ${SITE}`,
    description:
      'Apply for Hakaru RSA membership online. Complete your details and secure payment in a few steps.',
  },
  '/membership/renew': {
    title: `Renew Membership | ${SITE}`,
    description:
      'Renew your Hakaru RSA membership for the current year. Quick online renewal and payment.',
  },
  '/membership/success': {
    title: `Membership Submitted | ${SITE}`,
    description:
      'Thank you — your Hakaru RSA membership application or renewal has been received.',
  },
  '/renew': {
    title: `Become a Member | ${SITE}`,
    description:
      'Apply for Hakaru RSA membership online. Complete your details and secure payment in a few steps.',
  },
  '/events': {
    title: `What's On | ${SITE}`,
    description:
      'Upcoming events, regular club nights, and community gatherings at Hakaru RSA.',
  },
  '/contact': {
    title: `Contact | ${SITE}`,
    description:
      'Contact Hakaru & Districts RSA — address, phone, email, and opening hours.',
  },
  '/committee': {
    title: `Committee | ${SITE}`,
    description:
      'Meet the Hakaru RSA committee and office bearers serving members and the community.',
  },
  '/projects': {
    title: `Projects | ${SITE}`,
    description:
      'Community and veteran support projects undertaken by Hakaru & Districts RSA.',
  },
  '/gallery': {
    title: `Gallery | ${SITE}`,
    description:
      'Photo galleries from events, commemorations, and life at Hakaru RSA.',
  },
  '/newsletter': {
    title: `Newsletter | ${SITE}`,
    description:
      'Read past Hakaru RSA newsletters — club news, events, and community updates.',
  },
  '/donate': {
    title: `Donate | ${SITE}`,
    description:
      'Support Hakaru RSA with a one-off or recurring donation. Help veterans and local community programmes.',
  },
};

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed;
}

/**
 * @param {string} pathname
 * @returns {{ title: string, description: string, noindex: boolean }}
 */
export function getSeoForPath(pathname) {
  const path = normalizePathname(pathname);
  if (path.startsWith('/admin')) {
    return {
      title: `Admin | ${SITE}`,
      description: 'Hakaru RSA administration.',
      noindex: true,
    };
  }
  const found = BY_PATH[path];
  if (found) {
    return { ...found, noindex: false };
  }
  return {
    title: SITE,
    description: DEFAULT_DESCRIPTION,
    noindex: false,
  };
}
