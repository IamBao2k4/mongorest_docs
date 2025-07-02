'use client';

import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import useUnsaveForm from '@/hooks/useUnsaveForm';
import { getDataDetail } from './utils';
import { useToast } from '../use-toast';

function useEntityDetail({
  id,
  idQuery,
  type,
  entity,
  setLoading,
  properties,
  setSchemaBuider,
  posttype,
}) {
  const _id = id || idQuery;

  const params = useParams();
  const { toast } = useToast();
  const { setUnsavedChanges } = useUnsaveForm();
  const [data, setData] = useState({
    formData: {},
    formDataPreview: {},
    formDataCustom: {},
  });
  const [selects, setSelects] = useState([]);
  const [advance, setAdvance] = useState({});
  const [getByLanguage, setGetByLanguage] = useState(null);
  const [publishDate, setPublishDate] = useState({
    dateStart: '',
    dateEnd: '',
  });

  //NOTE; Get data detail
  const getData = useCallback(
    async function (locale, i) {
      setLoading(true);
      try {
        const result = await getDataDetail({
          entity,
          id: i,
          locale,
          properties,
          type: type || params?.pid,
          posttype,
        });

        const { data: dataRes } = result;
        if (dataRes) {
          setData((pre) => ({ ...pre, formData: dataRes }));
          onChangeAdvance([
            {
              key: 'titlePage',
              val: dataRes?.title || dataRes?.name || dataRes?.username,
            },
            { key: 'status', val: dataRes?.is_active },
            { key: 'statusLog', val: dataRes?.status_log },
          ]);

          if (dataRes?.published_start || dataRes?.published_end) {
            setPublishDate({
              dateStart: dataRes?.published_start || '',
              dateEnd: dataRes?.published_end || '',
            });
          }

          if (dataRes?.blocks) {
            setSelects(dataRes?.blocks);
          }

          if (dataRes?.schemaBuilder) {
            const __data = JSON.parse(JSON.stringify(dataRes?.schemaBuilder));
            delete dataRes.schemaBuilder;
            setSchemaBuider(__data);
          }

          switch (entity) {
            case 'posttype':
              onSetData('formDataCustom', dataRes?.formDataCustom);
              break;
            default:
              onSetData('formDataCustom', dataRes?.formDataCustom);
              break;
          }
        }
        setGetByLanguage(null);
        setLoading(false);
      } catch (err) {
        console.log('🚀 ~ file: useServiceDetail.js:215 ~ err:', err);
        toast({ description: 'Thất bại' });
        setGetByLanguage(null);
        setLoading(false);
      }
    },
    [idQuery, id, entity]
  );

  const onChangeAdvance = (vals) => {
    if (vals) {
      vals.map((item) => {
        setAdvance((pre) => ({ ...pre, [item.key]: item.val }));
      });
    }
  };
  const onChangeFormData = ({ data, type }) => {
    //NOTE: Flag check có đang nhập data hay không, khi reload trang hiện thông báo xác nh
    setUnsavedChanges(true);
    if (type === 'left' || type === 'right') {
      onSetData('formData', data);
      return;
    }

    if (type === 'custom') {
      onSetData('formDataCustom', data);
    }
  };

  const onSetData = (key, val) => {
    setData((pre) => ({ ...pre, [key]: val }));
  };

  useEffect(() => {
    if (_id && _id !== 'new') {
      getData(params.lang, _id);
    }
  }, [_id, params.lang]);

  useEffect(() => {
    if (getByLanguage) {
      //NOTE: Có tồn tại id hoặc id từ props thì mới call data
      if (_id && _id !== 'new') {
        getData(getByLanguage, _id);
      }
    }
  }, [getByLanguage]);

  return {
    ...data,
    ...advance,
    setFormData: (val) => onSetData('formData', val),
    setFormDataCustom: (val) => onSetData('formDataCustom', val),
    setFormDataPreview: (val) => onSetData('formDataPreview', val),
    getByLanguage,
    setGetByLanguage,
    onChangeFormData,
    publishDate,
    setPublishDate,
    selects,
    setSelects,
    getData,
    onChangeAdvance,
  };
}

export default useEntityDetail;
