/**
 * Canonical defaults for public site copy + CMS merge (server + Vite via shared re-export).
 * Deploy packages only `server/` — keep this file here (not under ../shared/) for Azure App Service.
 * Optional image fields: full URL after Admin → Site content upload.
 */
const siteContent = {
  site: {
    name: 'Hakaru RSA',
    tagline: 'Serving Our Veterans & Community',
  },

  navigation: {
    links: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Membership', href: '/membership' },
      { name: 'Projects', href: '/projects' },
      { name: 'Gallery', href: '/gallery' },
      { name: 'Donate', href: '/donate' },
      { name: 'Contact', href: '/contact' },
    ],
  },

  hero: {
    title: 'Hakaru & Districts RSA',
    subtitle: 'Honouring Service, Supporting Veterans, Building Community',
    ctaText: 'Become a Member',
    ctaLink: '/membership/become',
    imageUrl: '',
  },

  welcome: {
    title: 'Welcome to Hakaru RSA',
    content:
      "The Hakaru & Districts Returned and Services Association is dedicated to supporting our veterans, active service members, and their families. We provide a welcoming space for camaraderie, support, and community connection.",
    imageUrl: '',
  },

  announcements: {
    title: 'Announcements',
    subtitle:
      'Stay up to date with the latest news and happenings at Hakaru RSA',
    items: [
      {
        id: 1,
        emoji: '🌺',
        title: 'Poppy Day Volunteers Needed',
        content:
          "We're looking for volunteers to help with our upcoming Poppy Day appeal. Please contact us if you can help.",
      },
      {
        id: 2,
        emoji: '🎱',
        title: 'Pool Club Tournament',
        content:
          'Join us for our monthly pool tournament. Open to all members. Sign up at the bar.',
      },
      {
        id: 3,
        emoji: '📅',
        title: 'ANZAC Day Service',
        content:
          "April 25'th is ANZAC Day. Our annual commemoration service will be held at the RSA starting at 06:00 am.",
      },
    ],
  },

  upcomingEvents: {
    title: "What's On",
    subtitle: 'Join us for regular events and special occasions',
    events: [
      {
        id: 1,
        title: 'Pool Competition',
        date: 'Every Wednesday',
        time: '7:00 PM',
        description:
          'Enjoy a fun filled competition with good banter',
      },
      {
        id: 2,
        title: 'Bingo Night',
        date: 'Every Wednesday',
        time: '6:30 PM',
        description:
          'Weekly bingo night with great prizes. Open to all members.',
      },
      {
        id: 3,
        title: 'Sunday Roast',
        date: 'Every Sunday',
        time: '12:00 PM - 8:00 PM',
        description: 'Traditional Sunday roast dinner. Bookings recommended.',
      },
    ],
  },

  homeCta: {
    title: 'Ready to Join Our Community?',
    body:
      'Become a member today and enjoy access to all our facilities, events, and a supportive community of veterans and locals.',
    buttonText: 'Become a Member',
    buttonLink: '/membership/become',
    imageUrl: '',
  },

  about: {
    title: 'About Hakaru RSA',
    subtitle: 'Our History & Mission',
    introImageUrl: '',
    content:
      "The Hakaru & Districts RSA was established to serve the veterans and community of Hakaru and surrounding districts. We are committed to honouring the service and sacrifice of New Zealand's veterans while providing ongoing support and a vibrant social hub for our members.",
    rnzrsa: {
      title: 'RNZRSA Member',
      content: `Hakaru and Districts RSA are a member of the RNZRSA. We welcome members from affiliated clubs throughout New Zealand and Australia & new members and families to our facilities at 733 Settlement Road, Hakaru.

We are located no more than 10 minutes from both Kaiwaka and Mangawhai and offer our members, affiliated members and guests a great opportunity to enjoy our RSA and what it has to offer.

For your enjoyment the Hakaru RSA offers you friendship, great camaraderie, pool, snooker, darts, entertainment and a restaurant & bar in a safe secure environment.

We welcome all prospective members over the age of 13 to come to the RSA, check out our facilities and enjoy the friendship of our members – you are not required to be a returned service person to join.

We would like to acknowledge & deeply appreciate the fantastic work our volunteers do in the running of our association, their dedication along with the patronage of our members & guests is what helps us to keep our doors open. Thank you`,
      imageUrl: '',
    },
    mission: {
      title: 'Our Mission',
      items: [
        'Support veterans and their families',
        'Preserve the memory and spirit of ANZAC',
        'Foster camaraderie among service members',
        'Serve the wider Hakaru community',
      ],
    },
    /** Optional: logos grid — edit via About slug JSON */
    sponsors: {
      title: 'Our sponsors',
      intro: '',
      items: [],
    },
  },

  membership: {
    title: 'Membership',
    subtitle: 'Join Our RSA Family',
    types: [
      {
        name: 'RSA Member',
        price: '$40/year',
        description: 'For community members who support our mission',
        benefits: [
          'Full voting rights',
          'Access to all RSA facilities',
          'Member discounts at the bar',
          'Invitations to special events',
        ],
      },
      {
        name: 'Associate Member',
        price: '$40/year',
        description: 'For community members who support our mission',
        benefits: [
          'Access to all RSA facilities',
          'Member discounts at the bar',
          'Support veterans in your community',
          'Social events and activities',
        ],
      },
    ],
    howToJoin:
      'To become a member, simply visit us during opening hours with your ID and complete a membership form. For RSA membership, please bring your service documentation.',
    applyLink: '/membership/become',
  },

  contact: {
    title: 'Contact Us',
    pageSubtitle: 'Get in touch or visit us',
    address: {
      street: '733 Settlement Road',
      city: 'KAIWAKA 0573',
    },
    phone: '09 431 2176',
    email: 'info@hakarursa.co.nz',
    hours: {
      title: 'Opening Hours',
      items: [
        { day: 'Monday', hours: 'Closed' },
        { day: 'Tuesday- Friday', hours: '5:00 PM - 9:00 PM' },
        { day: 'Saturday', hours: 'Closed' },
        { day: 'Sunday', hours: 'Closed' },
      ],
    },
  },

  footer: {
    copyright: '© 2026 Hakaru & Districts RSA. All rights reserved.',
    quickLinks: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Membership', href: '/membership' },
      { name: 'Projects', href: '/projects' },
      { name: 'Gallery', href: '/gallery' },
      { name: 'Committee', href: '/committee' },
      { name: 'Contact', href: '/contact' },
    ],
  },

  projectsPage: {
    pageTitle: 'Community Projects',
    pageSubtitle: 'Making a difference in Hakaru and beyond',
    missionTitle: 'Our Commitment to Community',
    missionBody:
      'The Hakaru & Districts RSA is dedicated to serving our veterans, supporting our community, and preserving the ANZAC spirit. Through our various projects and initiatives, we strive to make a positive impact on the lives of those who have served and their families.',
    missionImageUrl: '',
    getInvolvedTitle: 'Get Involved',
    getInvolvedBody:
      'We welcome volunteers and supporters for all our projects. Whether you can donate time, resources, or simply spread the word, your contribution makes a difference.',
    pastInitiativesTitle: 'Past Initiatives',
    pastInitiatives: [
      {
        title: '2024 Community Christmas Party',
        description:
          'Provided Christmas celebrations for 150+ veterans and families',
      },
      {
        title: 'Memorial Plaque Installation',
        description:
          'New memorial plaques honoring local service members',
      },
      {
        title: 'Clubhouse Renovation',
        description:
          'Upgraded facilities to better serve our members and community',
      },
    ],
    items: [
      {
        id: 1,
        title: 'ANZAC Day Commemoration',
        description:
          'Our annual ANZAC Day service honors the brave men and women who served and sacrificed. The service includes a dawn ceremony, wreath laying, and community breakfast.',
        status: 'annual',
        emoji: '🌅',
        imageUrl: '',
      },
      {
        id: 2,
        title: 'Poppy Day Appeal',
        description:
          'Supporting the RSA Poppy Day appeal to raise funds for veteran welfare services. Volunteers collect donations at local shopping centers.',
        status: 'annual',
        emoji: '🌺',
        imageUrl: '',
      },
      {
        id: 3,
        title: 'Veterans Support Program',
        description:
          'Ongoing support for local veterans including welfare checks, transport to medical appointments, and assistance with accessing government services.',
        status: 'ongoing',
        emoji: '🤝',
        imageUrl: '',
      },
      {
        id: 4,
        title: 'Community Breakfast Club',
        description:
          'Monthly community breakfast bringing together veterans, families, and local residents to foster connection and combat isolation.',
        status: 'ongoing',
        emoji: '🍳',
        imageUrl: '',
      },
      {
        id: 5,
        title: 'Youth Leadership Program',
        description:
          'Supporting local youth through leadership development, mentoring, and scholarships for students interested in military or public service careers.',
        status: 'planning',
        emoji: '🎓',
        imageUrl: '',
      },
      {
        id: 6,
        title: 'Memorial Garden Maintenance',
        description:
          'Upkeep and beautification of the RSA memorial garden, ensuring our fallen comrades are honored with a beautiful, peaceful space.',
        status: 'ongoing',
        emoji: '🌻',
        imageUrl: '',
      },
    ],
  },

  eventsPage: {
    title: 'Events & Entertainment',
    subtitle: 'Regular events for members and the community',
    weeklyHeading: 'Weekly Events',
    specialHeading: 'Special Events',
    specialBody:
      'Keep an eye out for our special events including ANZAC Day commemorations, Poppy Day appeals, and seasonal celebrations.',
    specialFooter:
      'Check back here or follow our social media for upcoming special event announcements.',
  },

  committeePage: {
    title: 'Executive Committee',
    subtitle: 'Hakaru & Districts RSA',
    members: [
      {
        name: 'President Name',
        role: 'President',
        bio: 'Leading our RSA with dedication to veterans and community.',
        imageUrl: '',
      },
      {
        name: 'Vice President Name',
        role: 'Vice President',
        bio: 'Supporting the President and RSA operations.',
        imageUrl: '',
      },
      {
        name: 'Secretary Name',
        role: 'Secretary',
        bio: 'Managing communications and records.',
        imageUrl: '',
      },
      {
        name: 'Treasurer Name',
        role: 'Treasurer',
        bio: 'Managing finances and accounts.',
        imageUrl: '',
      },
      {
        name: 'Member Name',
        role: 'Committee Member',
        bio: 'Serving the RSA community.',
        imageUrl: '',
      },
      {
        name: 'Member Name',
        role: 'Committee Member',
        bio: 'Serving the RSA community.',
        imageUrl: '',
      },
    ],
    contactSection: {
      title: 'Contact the Committee',
      body:
        'Have a question or concern? The Executive Committee is here to help. Reach out to us via email or visit during opening hours.',
    },
    note:
      'Committee positions are filled by elected members. Elections are held annually. All RSA members are welcome to attend Annual General Meetings.',
  },

  donatePage: {
    title: 'Make a Donation',
    intro:
      'Support Hakaru & Districts RSA with a donation. Your contribution helps us continue our mission.',
    successTitle: 'Thank You for Your Donation!',
    successBody:
      'Your generous donation has been received. A confirmation email will be sent shortly.',
    successFootnote: 'Transaction reference has been recorded.',
    imageUrl: '',
  },
};

export default siteContent;
export { siteContent as defaultSiteContent };
