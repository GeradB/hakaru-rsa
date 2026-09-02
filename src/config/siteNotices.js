/** Active site-wide notices — remove or set enabled: false when no longer needed. */
export const SITE_NOTICES = [
  {
    id: 'head-kitchen-cook-2026',
    enabled: true,
    title: 'Now Hiring: Head Kitchen Cook',
    summary:
      'We are looking for an experienced Head Kitchen Cook to lead our kitchen team. Passion for good food and team spirit welcome.',
    imageSrc: '/cook-wanted.png',
    imageAlt: 'Wanted: Head Kitchen Cook at Hakaru & Districts Memorial RSA',
    contactHref: '/contact',
    contactLabel: 'Enquire now',
  },
];

export function getActiveSiteNotices() {
  return SITE_NOTICES.filter((notice) => notice.enabled);
}
