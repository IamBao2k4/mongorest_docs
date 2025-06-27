'use client';

import ContainerDetail from '@/components/common/ContainerDetail';
import ContainerForm from '@/components/common/ContainerForm';
import { useAuth } from '@/context/AuthContext';
import useServiceDetail from '@/hooks/useServiceDetail';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AllRemainingDetailNew() {
  const params = useParams();
  const { jsonSchema } = useAuth();

  const {
    schema,
    formData,
    onChangeFormData,
    titlePage,
    errors,
    onSubmit,
    loading,
    setGetByLanguage,
  } = useServiceDetail({ entity: params.entity });

  return (
    <ContainerDetail
      title={titlePage}
      loading={loading}
      setGetByLanguage={setGetByLanguage}
      settingSubmitCard={{
        onSubmit,
      }}>
      <div className='flex flex-col gap-5 max-w-[900px] w-full mx-auto'>
        <ContainerForm
          schema={schema}
          onChangeFormData={onChangeFormData}
          formData={formData}
          errors={errors}
        />
      </div>
    </ContainerDetail>
  );
}
