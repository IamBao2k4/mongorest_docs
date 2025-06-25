/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/getting-started',
        'tutorials/basic-queries',
        'tutorials/authentication',
        'tutorials/configuration',
      ],
    },
    {
      type: 'category',
      label: 'How-to Guides',
      items: [
        'how-to-guides/authentication',
        'how-to-guides/complex-queries'
      ],
    },
    {
      type: 'category',
      label: 'References',
      items: [
        'references/api',
        'references/configuration',
        'references/schema'
      ],
    },
    {
      type: 'category',
      label: 'Explanations',
      items: [
        'explanations/architecture',
        'explanations/query-translation',
        'explanations/security',
        'explanations/performance',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/express',
        'integrations/react',
        'integrations/vue',
        'integrations/nextjs',
      ],
    },
  ],
};

module.exports = sidebars;