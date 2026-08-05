/**
 * Human-friendly field schemas for Admin Site Content forms.
 * Paths are relative to the slug fragment returned by the API.
 */

const linkItem = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'href', label: 'URL / path', type: 'text' },
];

const announcementItem = [
  { key: 'emoji', label: 'Emoji', type: 'text', width: 'sm' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'content', label: 'Content', type: 'textarea' },
];

const eventItem = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'date', label: 'Date / schedule', type: 'text' },
  { key: 'time', label: 'Time', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const hourItem = [
  { key: 'day', label: 'Day', type: 'text' },
  { key: 'hours', label: 'Hours', type: 'text' },
];

const pastInitiativeItem = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const projectItem = [
  { key: 'emoji', label: 'Emoji', type: 'text', width: 'sm' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'status', label: 'Status', type: 'text', hint: 'e.g. annual, ongoing, planning' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'imageUrl', label: 'Image', type: 'image' },
];

const committeeMemberItem = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'role', label: 'Role', type: 'text' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'imageUrl', label: 'Photo', type: 'image' },
];

const membershipTypeItem = [
  { key: 'name', label: 'Type name', type: 'text' },
  { key: 'price', label: 'Price', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'benefits', label: 'Benefits', type: 'stringArray' },
];

const sponsorItem = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'imageUrl', label: 'Logo', type: 'image' },
  { key: 'url', label: 'Website (optional)', type: 'text' },
];

const lsaHelpItem = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'body', label: 'Body', type: 'textarea' },
  { key: 'linkText', label: 'Link text (optional)', type: 'text' },
  { key: 'linkUrl', label: 'Link URL (optional)', type: 'text' },
];

/** @type {Record<string, Array<{ section: string, fields: object[] }>>} */
export const CMS_FORM_SECTIONS = {
  global: [
    {
      section: 'Site name',
      fields: [
        { path: 'site.name', label: 'Site name', type: 'text' },
        { path: 'site.tagline', label: 'Tagline', type: 'text' },
      ],
    },
    {
      section: 'Main navigation',
      hint: 'These links appear in the site header.',
      fields: [
        {
          path: 'navigation.links',
          label: 'Menu links',
          type: 'objectArray',
          itemLabel: 'Link',
          itemFields: linkItem,
          newItem: () => ({ name: '', href: '/' }),
        },
      ],
    },
    {
      section: 'Footer',
      fields: [
        { path: 'footer.copyright', label: 'Copyright line', type: 'text' },
        {
          path: 'footer.quickLinks',
          label: 'Footer quick links',
          type: 'objectArray',
          itemLabel: 'Link',
          itemFields: linkItem,
          newItem: () => ({ name: '', href: '/' }),
        },
      ],
    },
  ],

  home: [
    {
      section: 'Hero (top of home page)',
      fields: [
        { path: 'hero.title', label: 'Title', type: 'text' },
        { path: 'hero.subtitle', label: 'Subtitle', type: 'textarea' },
        { path: 'hero.ctaText', label: 'Button text', type: 'text' },
        { path: 'hero.ctaLink', label: 'Button link', type: 'text' },
        { path: 'hero.imageUrl', label: 'Background / hero image', type: 'image' },
      ],
    },
    {
      section: 'Welcome',
      fields: [
        { path: 'welcome.title', label: 'Title', type: 'text' },
        { path: 'welcome.content', label: 'Welcome text', type: 'textarea', rows: 5 },
        { path: 'welcome.imageUrl', label: 'Image', type: 'image' },
      ],
    },
    {
      section: 'Announcements',
      fields: [
        { path: 'announcements.title', label: 'Section title', type: 'text' },
        { path: 'announcements.subtitle', label: 'Section subtitle', type: 'text' },
        {
          path: 'announcements.items',
          label: 'Announcement cards',
          type: 'objectArray',
          itemLabel: 'Announcement',
          itemFields: announcementItem,
          newItem: () => ({
            id: Date.now(),
            emoji: '',
            title: '',
            content: '',
          }),
        },
      ],
    },
    {
      section: "What's On (weekly events teaser)",
      hint: 'Also shown as the weekly list on the Events page.',
      fields: [
        { path: 'upcomingEvents.title', label: 'Section title', type: 'text' },
        { path: 'upcomingEvents.subtitle', label: 'Section subtitle', type: 'text' },
        {
          path: 'upcomingEvents.events',
          label: 'Events',
          type: 'objectArray',
          itemLabel: 'Event',
          itemFields: eventItem,
          newItem: () => ({
            id: Date.now(),
            title: '',
            date: '',
            time: '',
            description: '',
          }),
        },
      ],
    },
    {
      section: 'Bottom call to action',
      fields: [
        { path: 'homeCta.title', label: 'Title', type: 'text' },
        { path: 'homeCta.body', label: 'Body', type: 'textarea' },
        { path: 'homeCta.buttonText', label: 'Button text', type: 'text' },
        { path: 'homeCta.buttonLink', label: 'Button link', type: 'text' },
        { path: 'homeCta.imageUrl', label: 'Image', type: 'image' },
      ],
    },
  ],

  about: [
    {
      section: 'About page',
      fields: [
        { path: 'about.title', label: 'Title', type: 'text' },
        { path: 'about.subtitle', label: 'Subtitle', type: 'text' },
        { path: 'about.content', label: 'Intro', type: 'textarea', rows: 5 },
        { path: 'about.introImageUrl', label: 'Intro image', type: 'image' },
      ],
    },
    {
      section: 'RNZRSA member block',
      fields: [
        { path: 'about.rnzrsa.title', label: 'Title', type: 'text' },
        { path: 'about.rnzrsa.content', label: 'Content', type: 'textarea', rows: 8 },
        { path: 'about.rnzrsa.imageUrl', label: 'Image', type: 'image' },
      ],
    },
    {
      section: 'Mission',
      fields: [
        { path: 'about.mission.title', label: 'Title', type: 'text' },
        {
          path: 'about.mission.items',
          label: 'Mission points',
          type: 'stringArray',
          newItem: () => '',
        },
      ],
    },
    {
      section: 'Sponsors',
      fields: [
        { path: 'about.sponsors.title', label: 'Section title', type: 'text' },
        { path: 'about.sponsors.intro', label: 'Intro', type: 'textarea' },
        {
          path: 'about.sponsors.items',
          label: 'Sponsors',
          type: 'objectArray',
          itemLabel: 'Sponsor',
          itemFields: sponsorItem,
          newItem: () => ({ name: '', imageUrl: '', url: '' }),
        },
      ],
    },
  ],

  membership: [
    {
      section: 'Membership page',
      fields: [
        { path: 'membership.title', label: 'Title', type: 'text' },
        { path: 'membership.subtitle', label: 'Subtitle', type: 'text' },
        { path: 'membership.howToJoin', label: 'How to join', type: 'textarea', rows: 4 },
        { path: 'membership.applyLink', label: 'Apply link', type: 'text' },
        {
          path: 'membership.types',
          label: 'Membership types',
          type: 'objectArray',
          itemLabel: 'Type',
          itemFields: membershipTypeItem,
          newItem: () => ({
            name: '',
            price: '',
            description: '',
            benefits: [''],
          }),
        },
      ],
    },
  ],

  contact: [
    {
      section: 'Contact page',
      fields: [
        { path: 'contact.title', label: 'Title', type: 'text' },
        { path: 'contact.pageSubtitle', label: 'Subtitle', type: 'text' },
        { path: 'contact.address.street', label: 'Street address', type: 'text' },
        { path: 'contact.address.city', label: 'City / postcode', type: 'text' },
        { path: 'contact.phone', label: 'Phone', type: 'text' },
        { path: 'contact.email', label: 'Email', type: 'text' },
        { path: 'contact.hours.title', label: 'Hours heading', type: 'text' },
        {
          path: 'contact.hours.items',
          label: 'Opening hours',
          type: 'objectArray',
          itemLabel: 'Day',
          itemFields: hourItem,
          newItem: () => ({ day: '', hours: '' }),
        },
      ],
    },
  ],

  projects: [
    {
      section: 'Projects page',
      fields: [
        { path: 'projectsPage.pageTitle', label: 'Page title', type: 'text' },
        { path: 'projectsPage.pageSubtitle', label: 'Page subtitle', type: 'text' },
        { path: 'projectsPage.missionTitle', label: 'Mission title', type: 'text' },
        { path: 'projectsPage.missionBody', label: 'Mission body', type: 'textarea', rows: 4 },
        { path: 'projectsPage.missionImageUrl', label: 'Mission image', type: 'image' },
        { path: 'projectsPage.getInvolvedTitle', label: 'Get involved title', type: 'text' },
        {
          path: 'projectsPage.getInvolvedBody',
          label: 'Get involved body',
          type: 'textarea',
          rows: 3,
        },
        {
          path: 'projectsPage.pastInitiativesTitle',
          label: 'Past initiatives title',
          type: 'text',
        },
        {
          path: 'projectsPage.pastInitiatives',
          label: 'Past initiatives',
          type: 'objectArray',
          itemLabel: 'Initiative',
          itemFields: pastInitiativeItem,
          newItem: () => ({ title: '', description: '' }),
        },
        {
          path: 'projectsPage.items',
          label: 'Current projects',
          type: 'objectArray',
          itemLabel: 'Project',
          itemFields: projectItem,
          newItem: () => ({
            id: Date.now(),
            title: '',
            description: '',
            status: 'ongoing',
            emoji: '',
            imageUrl: '',
          }),
        },
      ],
    },
  ],

  events: [
    {
      section: 'Events page headings',
      hint: 'Weekly event cards are edited under Home → What’s On.',
      fields: [
        { path: 'eventsPage.title', label: 'Page title', type: 'text' },
        { path: 'eventsPage.subtitle', label: 'Page subtitle', type: 'text' },
        { path: 'eventsPage.weeklyHeading', label: 'Weekly events heading', type: 'text' },
        { path: 'eventsPage.specialHeading', label: 'Special events heading', type: 'text' },
        { path: 'eventsPage.specialBody', label: 'Special events body', type: 'textarea', rows: 4 },
        {
          path: 'eventsPage.specialFooter',
          label: 'Special events footer note',
          type: 'textarea',
          rows: 2,
        },
      ],
    },
  ],

  committee: [
    {
      section: 'Committee page',
      fields: [
        { path: 'committeePage.title', label: 'Title', type: 'text' },
        { path: 'committeePage.subtitle', label: 'Subtitle', type: 'text' },
        {
          path: 'committeePage.members',
          label: 'Committee members',
          type: 'objectArray',
          itemLabel: 'Member',
          itemFields: committeeMemberItem,
          newItem: () => ({ name: '', role: '', bio: '', imageUrl: '' }),
        },
        { path: 'committeePage.contactSection.title', label: 'Contact section title', type: 'text' },
        {
          path: 'committeePage.contactSection.body',
          label: 'Contact section body',
          type: 'textarea',
        },
        { path: 'committeePage.note', label: 'Footer note', type: 'textarea' },
      ],
    },
  ],

  donate: [
    {
      section: 'Donate page',
      fields: [
        { path: 'donatePage.title', label: 'Title', type: 'text' },
        { path: 'donatePage.intro', label: 'Intro', type: 'textarea', rows: 3 },
        { path: 'donatePage.imageUrl', label: 'Image', type: 'image' },
        { path: 'donatePage.successTitle', label: 'Success title', type: 'text' },
        { path: 'donatePage.successBody', label: 'Success body', type: 'textarea' },
        { path: 'donatePage.successFootnote', label: 'Success footnote', type: 'text' },
      ],
    },
  ],

  newsletter: [
    {
      section: 'Newsletter page copy',
      hint: 'Published issues are managed under Newsletter admin, not here.',
      fields: [
        { path: 'newsletterPage.pageTitle', label: 'Page title', type: 'text' },
        { path: 'newsletterPage.pageSubtitle', label: 'Page subtitle', type: 'text' },
        { path: 'newsletterPage.introTitle', label: 'Intro title', type: 'text' },
        { path: 'newsletterPage.introBody', label: 'Intro body', type: 'textarea', rows: 4 },
        { path: 'newsletterPage.listTitle', label: 'List title', type: 'text' },
        { path: 'newsletterPage.emptyMessage', label: 'Empty message', type: 'text' },
      ],
    },
  ],

  lsa: [
    {
      section: 'LSA / Veteran Support page',
      fields: [
        { path: 'lsaPage.title', label: 'Title', type: 'text' },
        { path: 'lsaPage.subtitle', label: 'Subtitle', type: 'textarea', rows: 3 },
        { path: 'lsaPage.servicesTitle', label: 'Services heading', type: 'text' },
        {
          path: 'lsaPage.introParagraphs',
          label: 'Intro paragraphs',
          type: 'stringArray',
          itemLabel: 'Paragraph',
          newItem: () => '',
        },
        { path: 'lsaPage.helpTitle', label: 'Help section heading', type: 'text' },
        {
          path: 'lsaPage.helpItems',
          label: 'Help items',
          type: 'objectArray',
          itemLabel: 'Item',
          itemFields: lsaHelpItem,
          newItem: () => ({ title: '', body: '', linkText: '', linkUrl: '' }),
        },
        { path: 'lsaPage.contactTitle', label: 'Contact heading', type: 'text' },
        { path: 'lsaPage.contactIntro', label: 'Contact intro', type: 'textarea' },
        { path: 'lsaPage.advisorLabel', label: 'Advisor label', type: 'text' },
        { path: 'lsaPage.advisorName', label: 'Advisor name', type: 'text' },
        { path: 'lsaPage.addressLabel', label: 'Address label', type: 'text' },
        { path: 'lsaPage.address', label: 'Address', type: 'text' },
        {
          path: 'lsaPage.addressMapsQuery',
          label: 'Maps search query',
          type: 'text',
          hint: 'Used for the map / directions link',
        },
        { path: 'lsaPage.mobileLabel', label: 'Mobile label', type: 'text' },
        { path: 'lsaPage.mobileDisplay', label: 'Mobile (display)', type: 'text' },
        {
          path: 'lsaPage.mobileTel',
          label: 'Mobile (dial link)',
          type: 'text',
          hint: 'Digits only, used for click-to-call',
        },
        { path: 'lsaPage.enquiriesLabel', label: 'Enquiries label', type: 'text' },
        {
          path: 'lsaPage.enquiryEmails',
          label: 'Enquiry emails',
          type: 'stringArray',
          newItem: () => '',
        },
        { path: 'lsaPage.websiteLabel', label: 'Website label', type: 'text' },
        { path: 'lsaPage.websiteText', label: 'Website link text', type: 'text' },
        { path: 'lsaPage.websiteHref', label: 'Website link URL', type: 'text' },
      ],
    },
  ],
};

export function hasCmsFormSchema(slug) {
  return Boolean(CMS_FORM_SECTIONS[slug]?.length);
}
