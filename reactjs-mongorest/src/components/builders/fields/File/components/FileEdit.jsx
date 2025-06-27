import FileBrowser from '@/components/common/FileBrowser';
import CardEditImage from '@/components/common/CardEditImage';
import { WrapperField } from '@/components/builders/elements';
import parse from '@/helpers/strToObject';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { mediaApi } from '@/services/media';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useParams } from 'react-router-dom';
import { FormImage } from '@/components/common/Media';

const FileEdit = ({ id, schema, required, onChange, value, props }) => {
  const [open, setOpen] = useState(false);
  let error = _.get(props, `formContext.errors[${id}]`);
  let file = parse(value === '[null]' || !value ? [] : value);
  const [state, setState] = useState([]);
  const [idMedia, setIdMedia] = useState('');
  const params = useParams();

  useEffect(() => {
    setState(value ? parse(value) : []);
  }, [value]);

  const onOk = async (selectResult) => {
    if (selectResult?.length > 0) {
      const result = await mediaApi(params.lang).getMediaList({
        params: { 'search[_id:in]': selectResult.join() },
      });
      setState(result?.data);
      onChange(result?.data);
      setOpen(false);
    }
  };

  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}
      error={error}>
      <Button
        type='button'
        className='h-8 gap-2'
        onClick={() => setOpen(true)}>
        <Upload className='w-3.5 h-3.5' />
        <span>Browser</span>
      </Button>
      <br />
      <span style={{ fontSize: '12px' }}>{schema?.meta}</span>
      {Array.isArray(state) ? (
        <CardEditImage
          state={state}
          setState={setState}
          isDisable={schema?.isDisable}
          onChange={onChange}
          setIdMedia={setIdMedia}
        />
      ) : null}

      <FileBrowser
        open={open}
        setOpen={setOpen}
        schema={schema}
        onOk={onOk}
        file={Array?.isArray(file) ? file : null}
      />

      {idMedia ? (
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
      ) : null}
    </WrapperField>
  );
};
export default FileEdit;
