import { useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import SchemaBuilder from './SchemaBuilder';
import { Button } from '@/components/ui/Button';

const JsonCovert = function ({ initialSchema, updateSchema }) {
  const [jsonInput, setJsonInput] = useState(() => {
    if (!initialSchema) return {};
    return {
      json: initialSchema?.json ? JSON.parse(initialSchema?.json) : {},
      ui: initialSchema?.ui ? JSON.parse(initialSchema?.ui) : {},
    };
  });

  const handleChangeJsonInput = (data) => {
    setJsonInput(data?.jsObject);
  };

  // const handleChangeJsonInput2 = (value) => {
  //   const jsonString = value;
  //   const jsonObject = JSON.parse(jsonString);
  //   console.log("jsonObject", jsonObject);
  //   setJsonInput(jsonObject);
  //   // const parsed = JSON.parse(value);
  //   // console.log("parsed", parsed);
  //   // setJsonInput(parsed?.json);
  //   // console.log("jsonInput:", jsonInput);
  //   // setJsonInput(value);
  // };

  const [jsonSchema, setJsonSchema] = useState(null);
  const handleSave = () => {
    try {
      setJsonSchema(jsonInput);
      // console.log("jsonSchemaSave:", jsonSchema);
    } catch (error) {
      alert('Invalid JSON Schema');
    }

    // try {
    //   const parsedSchema = JSON.parse(jsonInput);
    //   setJsonSchema(parsedSchema);
    // } catch (error) {
    //   alert("Invalid JSON Schema");
    // }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const showDrawer = () => {
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  const handleSaveSchemas = (json, ui) => {
    console.log('Saved JSON Schema:', json);
    console.log('Saved UI Schema:', ui);
  };

  return (
    <div className='flex flex-col gap-4 px-6 py-8 bg-white rounded-md'>
      {/* <TextArea
        showCount
        onChange={(e) => {
          handleChangeJsonInput2(e.target.value);
        }}
        placeholder="disable resize"
        style={{
          height: 500,
          resize: "none",
        }}
      /> */}

      <JSONInput
        id='data_schema'
        placeholder={typeof jsonInput === 'object' ? jsonInput : null}
        height={'500px'}
        width={'100%'}
        onChange={handleChangeJsonInput}
      />
      <div className='flex gap-2'>
        <Button
          // type="primary"
          style={{ backgroundColor: '#353b48', color: 'white' }}
          className='w-24'
          onClick={() => {
            handleSave();
          }}>
          Save
        </Button>
        <Button
          // type="primary"
          style={{ backgroundColor: '#2f3640', color: 'white' }}
          className='w-24'
          onClick={showDrawer}>
          Open
        </Button>
        <SchemaBuilder
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          onChange={handleSaveSchemas}
          jsonSchema={jsonSchema}
        />
        {/* <MultipleBuilder
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onChange={(newSchema, newUiSchema) => {
            console.log(
              "🚀 ~ GenerateJson ~ newSchema, newUiSchema:",
              newSchema,
              newUiSchema
            );
          }}
        /> */}
      </div>
    </div>
  );
};
export default JsonCovert;
