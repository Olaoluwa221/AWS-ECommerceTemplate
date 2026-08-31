/**
 * OWNER CONFIGURATION
 *
 * This file is the main place to customize the storefront for a new owner.
 * Keep business/brand copy here instead of hardcoding it inside components.
 * Visual colors/fonts live next to this file in theme.css.
 */
const BRAND_NAME = 'Company Name'
const LOCATION_LABEL = 'City, State'

export const siteConfig = {
  brand: {
    name: BRAND_NAME,
    shortName: 'XXX',
    legalName: BRAND_NAME,
    locationLabel: LOCATION_LABEL,
    wordmark: {
      line1: 'Company',
      line2: 'Name',
    },
    tagline: "Lorem Ipsum",
  },

  home: {
    marqueeItems: ['Strip 1', 'Strip 2', 'Strip 3', 'Strip 4'],
    hero: {
      description: 'Description',
      primaryCta: 'Shop the collection',
      secondaryCta: 'Create account',
    },
    showcaseCards: [
      {
        label: 'Item 1 title',
        name: 'Item 1 name',
        description: 'Item 1 description',
        options: [],
        price: 1,
        variant: 'light',
      },
      {
        label: 'Item 2 title',
        name: 'Item 2 name',
        description: 'Item 2 description',
        options: [],
        price: 1,
        variant: 'accent',
      },
      {
        label: 'Item 3 name',
        name: 'Item 3 title',
        description: 'Item 3 name',
        options: [],
        price: 1,
        variant: 'dark',
      },
    ],
    catalog: {
      eyebrow: 'The catalog',
      headingLine1: 'Line 1',
      headingLine2: 'Line 2',
      description: 'Lorem ipsum - you know the gist',
      categories: [
        { name: 'Item 1', description: 'Item 1 Description', emoji: '🌐' },
        { name: 'Item 2', description: 'Item 2 Description', emoji: '💻' },
        { name: 'Item 3', description: 'Item 3 Description', emoji: '🎨' },
        { name: 'Item 4', description: 'Item 4 Description', emoji: '🚀' },
        { name: 'Item 5', description: 'Item 5 Description', emoji: '✨' },
        { name: 'Item 6', description: 'Item 6 Description', emoji: '💡' },
      ],
    },
    manifesto: {
      eyebrow: 'The way we work',
      headingLine1: 'Small shop. Real hands.',
      headingLine2: 'No middlemen.',
      items: [
        { num: '01', title: 'Manifesto1Title', desc: 'Manifesto 1 Description' },
        { num: '02', title: 'Manifesto2Title', desc: 'Manifesto 2 Description' },
        { num: '03', title: 'Manifesto3Title', desc: 'Manifesto 3 Description' },
      ],
    },
    cta: {
      heading: 'Ready when you are.',
      description: "Browse what's in stock.",
      button: 'Shop everything',
    },
  },

  auth: {
    login: {
      headline: 'Description.',
      description: 'Description',
      footerText: `${BRAND_NAME} and Trademark`,
    },
    register: {
      headline: 'Get started today.',
      description: 'Create an account to start ordering prints, banners, signs, and more.',
      footerText: `${BRAND_NAME} trademark`,
    },
  },

  commerce: {
    locale: 'en-US',
    currency: 'USD',
    shippingFlatRate: 8,
    pickup: {
      businessName: BRAND_NAME,
      locationLabel: LOCATION_LABEL,
      readyMessage: "You'll receive a confirmation when your order is ready for pickup.",
    },
  },

  marketing: {
    exampleSubject: 'Summer sale — 20% off all prints!',
    exampleBody: "<h2>Big news!</h2><p>We're running a special promotion...</p>",
    exampleTipBody: "<h2>Big news!</h2><p>We're running a special promotion this week...</p>",
  },
}

export default siteConfig
