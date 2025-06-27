'use client';

import { TextError, TextLabel } from '@/components/builders/elements';
import { File, Relation } from '@/components/builders/fields';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { ENUM_TYPE_TAG } from '@/data/enum';
import { groupFieldsApi } from '@/services/group-fields';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function FormBuilder({ formData, onChange, className, errors }) {
  const params = useParams();
  const [locations, setLocations] = useState(null);
  const { getLocations } = groupFieldsApi(params.lang);

  useEffect(() => {
    async function getData() {
      const result = await getLocations({});

      if (result?.data) {
        setLocations({
          ...locations,
          locationsList: result.data,
        });
      }
    }

    getData();
  }, []);

  const renderFields = (field) => {
    let Title = null;
    let title = null;
    let typeRelation = null;
    let description = null;
    switch (field) {
      case 'posttype._':
        title = 'Posttype';
        description = 'Select posttype';
        typeRelation = ENUM_TYPE_TAG.posttype;
        Title = Relation;
        break;
      case 'category._':
        title = 'Categories';
        description = 'Select categories';
        typeRelation = ENUM_TYPE_TAG.category;
        Title = Relation;
        break;
      case 'collection._':
        title = 'Collection';
        description = 'Select collection';
        typeRelation = ENUM_TYPE_TAG.collection;
        Title = Relation;
        break;
      case 'user._':
        title = 'User';
        description = 'Select user';
        typeRelation = ENUM_TYPE_TAG.user;
        Title = Relation;
        break;
      case 'tag._':
        title = 'Tag';
        description = 'Select tag';
        typeRelation = ENUM_TYPE_TAG.tag;
        Title = Relation;
        break;
      case 'template._':
        title = 'Template';
        description = 'Select template';
        typeRelation = ENUM_TYPE_TAG.template;
        Title = Relation;
        break;
      case 'channel._':
        title = 'Channel';
        description = 'Select channels';
        typeRelation = ENUM_TYPE_TAG.channel;
        Title = Relation;
        break;
    }

    if (Title) {
      return (
        <div style={{ marginTop: 15 }}>
          <Title
            schema={{
              title,
              description,
              typeRelation,
            }}
            onChange={(data) =>
              onChange({
                dataFields: {
                  ...formData.dataFields,
                  [field.replace('._', '')]: data ? [...data] : [],
                },
              })
            }
            value={formData?.dataFields?.[field.replace('._', '')] || []}
            isCreateInModal={field === 'posttype._' ? false : true}
          />
        </div>
      );
    }
  };

  return (
    <>
      <Card title={'Normal Setting'}>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <TextLabel
              title='Name'
              description='Create rule to advanced custom fields'
              required
            />
            <Input
              value={formData?.name || ''}
              placeholder='Title'
              onChange={(ev) => {
                onChange({ name: ev.target.value });
              }}
              className='form-title'
            />
            <TextError text={errors?.name} />
          </div>
          <div className='flex flex-col gap-2'>
            <TextLabel
              title='Description'
              description='will use these
                advanced custom fields'
            />
            <Textarea
              value={formData.description || ''}
              placeholder='Description'
              rows={4}
              onChange={(ev) => onChange({ description: ev.target.value })}
              className='form-description'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <TextLabel
              title='Featured Image'
              description='Create rule to '
            />
            <File
              schema={{ library_setting: 'all' }}
              onChange={(data) => {
                onChange({ featured_image: data });
              }}
              value={formData.featured_image || ''}
            />
          </div>
        </div>
      </Card>
      {/* <Card
        style={{ marginTop: 10 }}
        title={'Advance Setting'}>
        <div style={{ padding: '10px' }}>
          <div style={{ display: 'grid', textAlign: 'left' }}>
            <TextLabel
              title='Location'
              required
              description='Create rule to determine which edit screens will use these
                advanced custom fields'
            />
            <Select
              mode='multiple'
              value={formData?.location || []}
              onChange={(ev) => {
                onChange({
                  location:
                    ev[ev.length - 1] === 'block._' || ev[0] === 'block._' ? ['block._'] : ev,
                });
              }}>
              {locations?.locationsList?.map((item, index) => {
                return (
                  <Select.Option
                    key={index}
                    value={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
            <TextError text={errors?.location} />
          </div>
          {formData?.location?.[0] === 'block._' && (
            <div style={{ display: 'grid', textAlign: 'left' }}>
              <TextLabel
                title='Group'
                description='Create rule to determine which edit screens will use these
                  advanced custom fields'
              />

              <Select
                style={{ width: '100%' }}
                value={formData.group}
                onChange={(ev) => {
                  onChange({ group: ev });
                }}
                allowClear>
                {listGroup?.map((item, index) => {
                  return (
                    <Option
                      key={index}
                      value={item.id}>
                      {item.title}
                    </Option>
                  );
                })}
              </Select>
            </div>
          )}

          <div>
            {formData?.location && formData?.location.length
              ? formData?.location?.map((item) => {
                  return renderFields(item);
                })
              : null}
          </div>
        </div>
      </Card> */}
    </>
  );
}
