'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import nestedProperty from 'nested-property';
import React, { useEffect, useState } from 'react';
import { getApiConfigValue } from '.';

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <EditableContext.Provider value={methods}>
        <tr {...props} />
      </EditableContext.Provider>
    </FormProvider>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleAdd,
  ...restProps
}) => {
  const { register, handleSubmit, setValue } = useFormContext();

  const save = async () => {
    handleSubmit((values) => {
      handleSave({
        ...record,
        ...values,
      });
    })();
  };

  let childNode = children;
  if (editable) {
    childNode = (
      <div style={{ margin: 0 }}>
        <Input
          {...register(dataIndex)}
          defaultValue={record[dataIndex]}
          onPressEnter={save}
          onBlur={save}
        />
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const Headers = ({ parameters, onChange, index }) => {
  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      header: '',
      value: '',
    },
  ]);

  const [count, setCount] = useState(2);
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };
  const defaultColumns = [
    {
      title: 'Header',
      dataIndex: 'header',
      width: '30%',
      editable: true,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      editable: true,
    },
    {
      title: '',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? <a onClick={() => handleDelete(record.key)}>Delete</a> : null,
    },
  ];
  const handleAdd = () => {
    const newData = {
      key: count,
      header: '',
      value: '',
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        handleAdd,
      }),
    };
  });

  useEffect(() => {
    nestedProperty.set(parameters, getApiConfigValue(index, 'headers'), dataSource);
    onChange({ ...parameters });
  }, [dataSource]);

  return (
    <div>
      <p level={5}>Headers</p>
      <div className='flex flex-col gap-2'>
        {/* <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        /> */}
        <div>
          <Button onClick={handleAdd}>Add a row</Button>
        </div>
      </div>
    </div>
  );
};
export default Headers;
