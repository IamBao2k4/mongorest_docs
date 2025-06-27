'use client';

import { Download } from 'lucide-react';
import TagFilter from '../TagFilter';
import ButtonColumn from './ButtonColumn';
import ButtonFilter from './ButtonFilter';
import ButtonSearch from './ButtonSearch';
import ButtonShowTree from './ButtonShowTree';
import ButtonView from './ButtonView';
import ButtonFunction from './ButtonFunction';
import { useAuth } from '@/context/AuthContext';
import ButtonSetting from './ButtonSetting';
import { Button } from '@/components/ui/Button';
import { useParams } from 'react-router-dom';
import ButtonImport from './ButtonImport';

const Action = ({
  showSearch = true,
  showFilter = true,
  toggleTree,
  textSearch = '',
  enterSearch,
  onChangeTextSearch,
  onChangeHeader,
  query,
  setQuery,
  pathProp,
  onChangeFilter,
  header,
  exportExcel,
  queryUrl,
  toggleShowTree,
  handleDeleteTag,
  layout,
  setLayout,
  entity,
  hasCategories,
  getData,
}) => {
  const onEnter = () => {
    enterSearch();
  };
  const params = useParams();
  const { jsonSchema } = useAuth();

  return (
    <div className='flex items-start justify-between py-2 shadow-md'>
      <div className='flex gap-2 flex-wrap flex-1'>
        <div className='flex gap-3'>
          {showSearch ? (
            <ButtonSearch
              onEnter={onEnter}
              textSearch={textSearch}
              onChangeTextSearch={onChangeTextSearch}
            />
          ) : null}

          {exportExcel ? (
            <Button
              onClick={exportExcel}
              variant='outline'
              className='gap-1 border-none'>
              <Download className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Export</span>
            </Button>
          ) : null}

          {hasCategories && <ButtonShowTree toggleTree={toggleTree} />}

          <ButtonColumn
            header={header}
            onChangeHeader={onChangeHeader}
            pathProp={pathProp}
          />

          <ButtonFilter
            showFilter={showFilter}
            query={query}
            setQuery={setQuery}
            header={header}
            onChangeFilter={onChangeFilter}
          />

          <ButtonView
            layout={layout}
            setLayout={setLayout}
          />

          <ButtonFunction />

          {jsonSchema?.[params?.entity]?.type === 'post-type' ? (
            <ButtonImport
              entity={jsonSchema?.[params?.entity]}
              getData={getData}
            />
          ) : null}
        </div>
        <TagFilter
          header={header}
          queryFilter={query}
          hideFilter={false}
          queryUrl={queryUrl}
          handleDeleteTag={handleDeleteTag}
          toggleShowTree={toggleShowTree}
        />
      </div>
      {jsonSchema?.[entity]?._id ? <ButtonSetting id={jsonSchema?.[entity]?._id} /> : null}
    </div>
  );
};

export default Action;
