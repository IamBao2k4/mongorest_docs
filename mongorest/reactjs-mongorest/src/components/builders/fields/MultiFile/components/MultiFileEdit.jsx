import FileBrowser from '@/components/common/FileBrowser';
import CardEditImage from '@/components/common/CardEditImage';
import parse from '@/helpers/strToObject';
import { Button } from '@/components/ui/Button';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { WrapperField } from '@/components/builders/elements';
import { FormImage } from '@/components/common/Media';
import { mediaApi } from '@/services/media';
import { useParams } from 'react-router-dom';

const MyCustomFileWidget = ({ id, value, schema, required, onChange }) => {
  let file = parse(value);
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [idMedia, setIdMedia] = useState('');
  const [state, setState] = useState([]);

  useEffect(() => {
    setState(value ? parse(value) : []);
  }, [value]);

  const onOk = async (selectResult) => {
    if (selectResult && Array.isArray(selectResult) && selectResult.length > 0) {
      try {
        const result = await mediaApi(params.lang).getMediaList({
          params: { 'search[_id:in]': selectResult?.filter((item) => item).join(), limit: 'all' },
        });
        setState(result?.data);
        onChange(result?.data);
        setOpen(false);
      } catch (err) {
        console.log('🚀 ~ onOk ~ err:', err);
      }
    }
  };

  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}>
      <FormImage
        idMedia={idMedia}
        setIdMedia={setIdMedia}
        changeFormImage={(id, res) => {
          const index = _.findIndex(state, { id });
          setState((prev) => {
            prev.splice(index, 1, res);
            return prev;
          });
        }}
      />
      <div id={id}>
        <Button
          type='button'
          disabled={schema?.isDisable}
          onClick={() => setOpen(true)}>
          Browser
        </Button>
        <br />
        <span style={{ fontSize: '12px' }}>{schema?.meta}</span>
        {state && (
          <CardEditImage
            state={state}
            setState={setState}
            isDisable={schema?.isDisable}
            onChange={onChange}
            setIdMedia={setIdMedia}
          />
        )}
        <FileBrowser
          open={open}
          setOpen={setOpen}
          schema={schema}
          onOk={onOk}
          file={file ? file : null}
        />
      </div>
    </WrapperField>
  );
};

export default MyCustomFileWidget;
