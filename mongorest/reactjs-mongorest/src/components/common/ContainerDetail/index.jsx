'use client';

import { Spin } from '@/components/ui/Spin';
import PageHeader from '../PageHeader';
import SubmitCard from './SubmitCard';
import clsx from 'clsx';

const ContainerDetail = ({
  children,
  title,
  loading = false,
  settingSubmitCard,
  hiddenSubmitCard = false,
  entity,
  advanceFooter,
  className,
  headerExtraActions,
}) => {
  return (
    <>
      <div className='flex flex-col gap-4 h-screen overflow-y-auto'>
        <PageHeader
          title={title}
          entity={entity}
          extraActions={headerExtraActions}
        />
        <Spin
          spinning={loading}
          className={clsx('px-4 flex-1 overflow-auto', className)}>
          {children}
        </Spin>
        {settingSubmitCard && !hiddenSubmitCard ? (
          <SubmitCard
            onSubmit={settingSubmitCard?.onSubmit}
            preview={settingSubmitCard?.preview}
            previewTitle={settingSubmitCard?.previewTitle || 'Preview'}
            onPreview={settingSubmitCard?.onPreview}
            advanceData={settingSubmitCard?.advanceData}
            loadingProps={loading}
            advanceFooter={advanceFooter}
          />
        ) : null}
      </div>
    </>
  );
};
export default ContainerDetail;
