'use client';

import ContainerDetail from '@/components/common/ContainerDetail';
import ContainerForm from '@/components/common/ContainerForm';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { entityApi } from '@/services/entity';
import useServiceDetail from '@/hooks/useServiceDetail';
import { useEffect, useState } from 'react';

export default function RoleDetail() {
  const {
    schema,
    formData,
    setFormData,
    onChangeFormData,
    titlePage,
    errors,
    onSubmit,
    loading,
    setGetByLanguage,
  } = useServiceDetail({ entity: 'role' });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await entityApi().getEntityAll({ params: { limit: 100 } });
        setRoles(res.data);
      } catch (error) {
        console.log('🚀 ~ fetchData ~ error:', error?.response?.data?.message);
      }
    };
    fetchData();
  }, []);

  const handleChecked = (checked, item, rule) => {
    if (checked) {
      setFormData({
        ...formData,
        permission: {
          ...(formData?.permission || {}),
          [item?.title]: [...(formData?.permission?.[item?.title] || []), rule],
        },
      });
    } else {
      setFormData({
        ...formData,
        permission: {
          ...(formData?.permission || {}),
          [item?.title]: formData?.permission?.[item?.title]?.filter((item) => item !== rule),
        },
      });
    }
  };

  const handleCheckedGroup = (checked, item) => {
    if (checked) {
      setFormData({
        ...formData,
        permission: {
          ...(formData?.permission || {}),
          [item?.title]: [
            'get-all',
            'get',
            'post',
            'put',
            'delete',
            'get-all-self',
            'get-self',
            'post-self',
            'put-self',
            'delete-self',
          ],
        },
      });
    } else {
      setFormData({
        ...formData,
        permission: {
          ...(formData?.permission || {}),
          [item?.title]: [],
        },
      });
    }
  };

  const handleCheckedAll = (checked) => {
    if (checked) {
      const _roles = JSON.parse(JSON.stringify(roles));
      const _res = {};

      _roles?.map((cur) => {
        _res[cur?.title] = [
          'get-all',
          'get',
          'post',
          'put',
          'delete',
          'get-all-self',
          'get-self',
          'post-self',
          'put-self',
          'delete-self',
        ];
      });
      setFormData({
        ...formData,
        permission: _res,
      });
    } else {
      setFormData({
        ...formData,
        permission: {},
      });
    }
  };
  return (
    <ContainerDetail
      title={titlePage}
      loading={loading}
      setGetByLanguage={setGetByLanguage}
      settingSubmitCard={{
        onSubmit,
      }}>
      <div className='flex flex-col gap-5'>
        <ContainerForm
          schema={schema}
          onChangeFormData={onChangeFormData}
          formData={formData}
          errors={errors}
        />

        <div className='flex gap-5'>
          <Button
            variant='outline'
            onClick={() => handleCheckedAll(true)}>
            Chọn tất cả
          </Button>
          <Button
            variant='outline'
            onClick={() => handleCheckedAll(false)}>
            Hủy tất cả
          </Button>
        </div>
        <div>
          {roles?.map((item) => {
            return (
              <div
                className='shadow-lg p-4'
                key={item}>
                <div className='flex gap-5 items-center py-3'>
                  <Button
                    variant='outline'
                    onClick={() => handleCheckedGroup(true, item)}>
                    Chọn tất cả
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => handleCheckedGroup(false, item)}>
                    Hủy tất cả
                  </Button>
                  <p className='text-[20px] font-semibold capitalize'>
                    {item?.title?.replace(/-/g, ' ')}
                  </p>
                </div>
                <div className='flex gap-10'>
                  {['get-all', 'get', 'post', 'put', 'delete'].map((rule) => {
                    return (
                      <div key={rule}>
                        <p>{rule}</p>
                        {[
                          { title: 'All', type: '' },
                          { title: 'Self', type: 'self' },
                        ].map((typeRule) => {
                          return (
                            <div
                              key={item}
                              className='flex gap-2 items-center'>
                              <Checkbox
                                checked={formData?.permission?.[item.title]?.includes(
                                  rule + (typeRule.type ? '-' + typeRule.type : typeRule.type)
                                )}
                                onCheckedChange={(checked) =>
                                  handleChecked(
                                    checked,
                                    item,
                                    rule + (typeRule.type ? '-' + typeRule.type : typeRule.type)
                                  )
                                }
                              />
                              <p>{typeRule?.title}</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ContainerDetail>
  );
}
