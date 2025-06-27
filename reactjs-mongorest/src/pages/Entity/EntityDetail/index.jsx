'use client';

import ContainerDetail from '@/components/common/ContainerDetail';
import { useAuth } from '@/context/AuthContext';
import useServiceDetail from '@/hooks/useServiceDetail';
import InitGroupFields from './InitGroupFields';
import JsonBuilderVer2 from './JsonBuilderVer2';
import Setting from './Setting';
import TabGroupFields from './TabGroupFields';
import { useEffect, useState } from 'react';
import { JsonBuilder, JsonForm } from '@/components/builders';
import JSONInput from 'react-json-editor-ajrm';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default function EntityDetail({ type }) {
  const { setRefreshSidebar, jsonSchema } = useAuth();
  const { schema, schemaBuilder, setSchemaBuider, formData, setFormData, titlePage, onSubmit } =
    useServiceDetail({ entity: type || 'entity' });
  const [text, setText] = useState('');

  const handleUpdateSchema = ({ form }) => {
    setSchemaBuider(form);
  };

  const [showBuilder, setShowBuilder] = useState('init');

  useEffect(() => {
    const _json = JSON.parse(schemaBuilder?.json);
    const _ui = JSON.parse(schemaBuilder?.ui);
    if (
      formData?.use_parent &&
      !_json?.properties?.parent_id &&
      formData?.mongodb_collection_name
    ) {
      if (!_json?.properties) _json.properties = {};
      _json.properties.parent_id = {
        title: 'Parent ID',
        type: 'string',
        widget: 'relation',
        typeRelation: {
          title: formData?.mongodb_collection_name,
          id: formData?.mongodb_collection_name,
        },
      };

      _ui.parent_id = {
        'ui:widget': 'relation',
      };

      if (!_ui?.['ui:order']) _ui['ui:order'] = [];
      _ui['ui:order'].push('parent_id');

      setSchemaBuider({ json: JSON.stringify(_json), ui: JSON.stringify(_ui) });
    }
  }, [formData?.use_parent]);

  useEffect(() => {
    if (formData?.use_locale && !formData?.languages) {
      setFormData({
        ...formData,
        languages: [
          { locale: 'vi', slug: '' },
          { locale: 'en', slug: '' },
        ],
      });
    }
  }, [formData?.use_locale]);

  return (
    <ContainerDetail
      title={titlePage}
      className='flex flex-col !overflow-hidden'
      entity={type || 'entity'}
      settingSubmitCard={{
        onSubmit: async (val) => {
          await onSubmit(val);
          setRefreshSidebar(true);
        },
      }}>
      <div className='flex-1 overflow-auto flex flex-col'>
        <TabGroupFields
          formData={formData}
          showBuilder={showBuilder}
          setShowBuilder={setShowBuilder}
        />

        {showBuilder === 'init' ? (
          <InitGroupFields
            schema={schema}
            formData={formData}
            setFormData={setFormData}
            showTagFields={false}
          />
        ) : null}

        {showBuilder === 'json-builder' ? (
          <JsonBuilder
            schema={schemaBuilder.json}
            uischema={schemaBuilder.ui}
            onChange={(newSchema, newUiSchema) => {
              setSchemaBuider({
                json: newSchema,
                ui: newUiSchema,
              });
            }}
            errors={{}}
          />
        ) : null}

        {showBuilder === 'json-builder-v2' ? (
          <JsonBuilderVer2
            schemaBuilder={schemaBuilder}
            setSchemaBuider={setSchemaBuider}
          />
        ) : null}

        {showBuilder === 'preview-form' ? (
          <div className='flex justify-center'>
            <div className='w-full max-w-[1000px]'>
              <JsonForm
                schema={schemaBuilder.json}
                uischema={schemaBuilder.ui}
                initFormData={{}}
                onChangeFormData={() => {}}
              />
            </div>
          </div>
        ) : null}

        {showBuilder === 'view-json' ? (
          <div className='flex gap-5'>
            <JSONInput
              placeholder={{
                json: JSON.parse(schemaBuilder.json),
                ui: JSON.parse(schemaBuilder.ui),
              }}
              height='auto'
              width='100%'
              viewOnly
            />
            <div className='w-[300px] shrink-0 flex flex-col gap-4'>
              <Textarea
                type='text'
                className='h-[300px]'
                value={text}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setText(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  try {
                    const _data = JSON.parse(text);
                    setSchemaBuider({
                      json: JSON.stringify(_data.json),
                      ui: JSON.stringify(_data.ui),
                    });
                  } catch (error) {
                    const evalObject = eval('(' + text + ')');
                    setSchemaBuider({
                      json: JSON.stringify(evalObject.json),
                      ui: JSON.stringify(evalObject.ui),
                    });
                  }
                }}>
                Save
              </Button>
            </div>
          </div>
        ) : null}

        {showBuilder === 'setting' ? (
          <Setting
            schemaBuilder={schemaBuilder}
            formData={formData}
            setFormData={setFormData}
          />
        ) : null}
      </div>
    </ContainerDetail>
  );
}
