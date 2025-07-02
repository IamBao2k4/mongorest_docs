'use client';

import Container from './Container';
import { TableProvider } from './table-context';

export default function ContainerTable({ children, inModal, entity, ...props }) {
  return (
    <TableProvider defaultState={{ inModal, entity }}>
      <Container
        {...props}
        entity={entity}>
        {children}
      </Container>
    </TableProvider>
  );
}
