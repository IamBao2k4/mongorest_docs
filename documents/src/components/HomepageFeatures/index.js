import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Schema-Driven Development',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Define your data structure with JSON Schema and MongoREST automatically 
        generates complete RESTful APIs with validation, relationships, and documentation.
      </>
    ),
  },
  {
    title: 'PostgREST-Style Queries',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Powerful query syntax inspired by PostgREST. Filter, sort, paginate, 
        and traverse relationships with intuitive URL parameters.
      </>
    ),
  },
  {
    title: 'Enterprise-Ready Security',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built-in JWT authentication, role-based access control, field-level permissions,
        and comprehensive audit logging. Security first, always.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}