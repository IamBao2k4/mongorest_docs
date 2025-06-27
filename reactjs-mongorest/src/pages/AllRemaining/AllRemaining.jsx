'use client';

import ContainerIndex from '@/components/common/ContainerIndex';
import { useParams } from 'react-router-dom';

export default function Tags() {
  const params = useParams();
  return (
    <ContainerIndex
      key={params['entity']}
      title='entity'
      entity={params['entity']}
    />
  );
}
