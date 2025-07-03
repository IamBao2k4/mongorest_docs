/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/philosophy',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/data-flow',
      ],
    },
        {
      type: 'category',
      label: 'Schema',
      items: [
        'schema/schema-structure',
        'schema/field-types',
      ],
    },
    {
      type: 'category',
      label: 'RBAC (Role-Based Access Control)',
      items: [
        'rbac/rbac-configuration',
        'rbac/rbac-function'
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/plugin-system',
        'features/query-api',
        'features/rbac',
        'features/relationships',
        'features/schema-field',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/basic-queries',
        'api-reference/advanced-queries',
        'api-reference/relationship-queries',
        'api-reference/debug-mode',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/operators',
      ],
    },
  ],
};

module.exports = sidebars;