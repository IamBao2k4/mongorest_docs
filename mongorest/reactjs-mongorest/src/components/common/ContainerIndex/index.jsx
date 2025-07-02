'use client';

import { getApiIndex } from '@/helpers/getApiIndex';
import { useState } from 'react';
import ContainerTable from '../ContainerTable';
import PageHeader from '../PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const ContainerIndex = ({
  title = '',
  entity,
  onClickBtn,
  hideButtonCreate,
  isShowTree,
  children,
  getDataAgain,
  setGetDataAgain,
  onClickRow,
  disableRowSelect,
  isCategories = false,
  exportExcel,
  actions,
  defaultParams,
  showAddNew,
}) => {
  const params = useParams();
  const [select, setSelect] = useState([]);
  const [selectFlat, setSelectFlat] = useState([]);
  const { jsonSchema } = useAuth();
  const [getData, deleteData] = getApiIndex(entity, params.lang, jsonSchema);

  return (
    <div className='h-screen flex flex-col'>
      <PageHeader
        entity={entity}
        showAddNew={showAddNew}
      />
      {children}
      {entity ? (
        <ContainerTable
          isShowTree={isShowTree}
          getData={(props) => {
            return getData({
              ...props,
              ...(defaultParams ? { params: { ...(props?.params || {}), ...defaultParams } } : {}),
            });
          }}
          deleteData={deleteData}
          posttype={entity}
          select={select}
          setSelect={setSelect}
          selectFlat={selectFlat}
          setSelectFlat={setSelectFlat}
          setGetDataAgain={setGetDataAgain}
          getDataAgain={getDataAgain}
          onClickRow={onClickRow}
          disableRowSelect={disableRowSelect}
          isCategories={isCategories}
          exportExcel={exportExcel}
          onClickBtn={onClickBtn}
          hideButtonCreate={hideButtonCreate}
          actions={actions}
          entity={entity}
        />
      ) : null}
    </div>
  );
};
export default ContainerIndex;
