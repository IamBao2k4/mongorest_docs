'use client';

import {
  Root,
  CollapsibleTrigger,
  CollapsibleContent as Content,
} from '@radix-ui/react-collapsible';

import './Collapsible.module.css';

import clsx from 'clsx';
import styles from './Collapsible.module.css';

const Collapsible = Root;

function CollapsibleContent({ children, className, ...props }) {
  return (
    <Content
      className={clsx(styles.CollapsibleContent, className)}
      {...props}>
      {children}
    </Content>
  );
}
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
