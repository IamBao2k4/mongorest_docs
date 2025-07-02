'use client';

import ContainerDetail from '@/components/common/ContainerDetail';
import ContainerForm from '@/components/common/ContainerForm';
import { useAuth } from '@/context/AuthContext';
import useServiceDetail from '@/hooks/useServiceDetail';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EditTags() {
  const params = useParams();
  const { jsonSchema } = useAuth();
  const _entity = jsonSchema?.[params.entity];

  const {
    schema,
    formData,
    onChangeFormData,
    titlePage,
    errors,
    onSubmit,
    loading,
    selects,
    setGetByLanguage,
  } = useServiceDetail({ entity: params.entity });

  const hasUseBlock = _entity?.use_block;

  return (
    <ContainerDetail
      title={titlePage}
      loading={loading}
      setGetByLanguage={setGetByLanguage}
      settingSubmitCard={{
        onSubmit,
      }}>
      {Object.keys(formData)?.length > 0 && (
        <div className='flex flex-col gap-5 w-full max-w-[900px] mx-auto'>
          <ContainerForm
            schema={schema}
            onChangeFormData={onChangeFormData}
            formData={formData}
            errors={errors}
          />
        </div>
      )}
    </ContainerDetail>
  );
}
