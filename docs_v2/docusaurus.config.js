// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MongoREST',
  tagline: 'The Missing API Layer for MongoDB',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://mongorest.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mongorest', // Usually your GitHub org/user name.
  projectName: 'mongorest', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/mongorest/mongorest/tree/main/docs/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/mongorest-social-card.jpg',
      navbar: {
        title: 'MongoREST',
        logo: {
          alt: 'MongoREST Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          // Remove this line: {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/mongorest/mongorest',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
              {
                label: 'API Reference',
                to: '/docs/api-reference/basic-queries',
              },
              {
                label: 'Guides',
                to: '/docs/guides/e-commerce-example',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/mongorest',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/mongorest',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/mongorest',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/mongorest/mongorest',
              },
              {
                label: 'NPM',
                href: 'https://www.npmjs.com/package/@mongorest/core',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MongoREST Project. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'javascript', 'typescript'],
      },
    }),
};

module.exports = config;