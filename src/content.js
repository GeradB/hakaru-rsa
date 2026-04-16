// ============================================
// HAKARU RSA WEBSITE CONTENT
// Edit all website content in this file
// ============================================

export const siteContent = {
  // Site-wide settings
  site: {
    name: "Hakaru RSA",
    tagline: "Serving Our Veterans & Community",
  },

  // Navigation
  navigation: {
    links: [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Membership", href: "/membership" },
      { name: "Events", href: "/events" },
      { name: "Contact", href: "/contact" },
    ],
  },

  // Hero Section (main banner on homepage)
  hero: {
    title: "Hakaru & Districts RSA",
    subtitle: "Honouring Service, Supporting Veterans, Building Community",
    ctaText: "Become a Member",
    ctaLink: "/membership",
  },

  // Welcome/Introduction Section
  welcome: {
    title: "Welcome to Hakaru RSA",
    content: `The Hakaru & Districts Returned and Services Association is dedicated to supporting our veterans, active service members, and their families. We provide a welcoming space for camaraderie, support, and community connection.`,
  },

  // Announcements (shown on homepage)
  announcements: {
    title: "Announcements",
    items: [
      {
        id: 1,
        emoji: "🌺",
        title: "Poppy Day Volunteers Needed",
        content: "We're looking for volunteers to help with our upcoming Poppy Day appeal. Please contact us if you can help.",
      },
      {
        id: 2,
        emoji: "🎱",
        title: "Pool Club Tournament",
        content: "Join us for our monthly pool tournament. Open to all members. Sign up at the bar.",
      },
      {
        id: 3,
        emoji: "📅",
        title: "ANZAC Day Service",
        content: "   April 25'th is ANZAC Day. Our annual commemoration service will be held at the RSA starting at 06:00 am.",
      },
    ],
  },

  // Upcoming Events (shown on homepage)
  upcomingEvents: {
    title: "What's On",
    events: [
      {
        id: 1,
        title: "Pool Competition",
        date: "Every Wednesday",
        time: "7:00 PM",
        description: "Enjoy a fun filled competition with good banter",
      },
      {
        id: 2,
        title: "Bingo Night",
        date: "Every Wednesday",
        time: "6:30 PM",
        description: "Weekly bingo night with great prizes. Open to all members.",
      },
      {
        id: 3,
        title: "Sunday Roast",
        date: "Every Sunday",
        time: "12:00 PM - 8:00 PM",
        description: "Traditional Sunday roast dinner. Bookings recommended.",
      },
    ],
  },

  // About Section
  about: {
    title: "About Hakaru RSA",
    subtitle: "Our History & Mission",
    content: `The Hakaru & Districts RSA was established to serve the veterans and community of Hakaru and surrounding districts. We are committed to honouring the service and sacrifice of New Zealand's veterans while providing ongoing support and a vibrant social hub for our members.`,
    mission: {
      title: "Our Mission",
      items: [
        "Support veterans and their families",
        "Preserve the memory and spirit of ANZAC",
        "Foster camaraderie among service members",
        "Serve the wider Hakaru community",
      ],
    },
  },

  // Membership Information
  membership: {
    title: "Membership",
    subtitle: "Join Our RSA Family",
    types: [
      {
        name: "RSA Member",
        price: "$40/year",
        description: "For community members who support our mission",
        benefits: [
          "Full voting rights",
          "Access to all RSA facilities",
          "Member discounts at the bar",
          "Invitations to special events",
        ],
      },
      {
        name: "Associate Member",
        price: "$40/year",
        description: "For community members who support our mission",
        benefits: [
          "Access to all RSA facilities",
          "Member discounts at the bar",
          "Support veterans in your community",
          "Social events and activities",
        ],
      },
    ],
    howToJoin: `To become a member, simply visit us during opening hours with your ID and complete a membership form. For RSA membership, please bring your service documentation.`,
  },

  // Contact Information
  contact: {
    title: "Contact Us",
    address: {
      street: "733 Settlement Road",
      city: "KAIWAKA 0573",
    },
    phone: "09 431 2176",
    email: "info@hakarursa.co.nz",
    hours: {
      title: "Opening Hours",
      items: [
        { day: "Monday", hours: "Closed" },
        { day: "Tuesday- Friday", hours: "5:00 PM - 9:00 PM" },
        { day: "Saturday", hours: "Closed" },
        { day: "Sunday", hours: "Closed" },
      ],
    },
  },

  // Footer
  footer: {
    copyright: "© 2026 Hakaru & Districts RSA. All rights reserved.",
    quickLinks: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Membership", href: "/membership" },
      { name: "Contact", href: "/contact" },
    ],
  },
};
