import parse from '@/helpers/strToObject';
import { excludeKeys, generateCategoryHash, stringify } from '@/helpers/utils';
import { useEffect, useState } from 'react';

const SchemaBuilder = ({
  isOpen,
  onClose,
  jsonSchema,
  schemaBuilder,
  setSchemaBuider,
  fields,
  type,
  onChange,
  setIsDrawerOpen,
}) => {
  const [data, setData] = useState(() => {
    if (jsonSchema) {
      try {
        return jsonSchema;
      } catch (error) {
        return {};
        console.error('Invalid JSON:', error);
      }
    }
  });

  useEffect(() => {
    if (jsonSchema) {
      try {
        setData(jsonSchema);
      } catch (error) {
        setData({});
        console.error('Invalid JSON:', error);
      }
    }
  }, [jsonSchema]);

  const schemaData = parse(schemaBuilder?.json) || {};
  schemaData.type = 'object';
  if (!schemaData?.properties) schemaData.properties = {};

  const uiSchemaData = parse(schemaBuilder?.ui);

  const allFormInputs = excludeKeys(Object.assign({}, fields));
  const categoryHash = generateCategoryHash(allFormInputs);

  const handleSchemaChange = (newSchema, newUiSchema) => {
    setSchemaBuider({
      json: newSchema,
      ui: newUiSchema,
    });
  };
  const properties = {
    schema: schemaData,
    uischema: uiSchemaData,
    onChange: (newSchema, newUiSchema) => {
      handleSchemaChange(stringify(newSchema), stringify(newUiSchema));
    },
    definitionData: schemaData?.definitions,
    definitionUi: uiSchemaData?.definitions,
    categoryHash,
    mods: {},
  };

  // console.log(" schemaData", schemaData);

  // width={'60vw'}
  //     title={`Tree Data`}
  //     placement='right'
  //     closable={true}
  //     onClose={onClose}
  //     open={isOpen}>

  return (
    <></>
    // <Drawer
    //   title={`Tree Data`}
    //   isOpen={isOpen}
    //   onClose={onClose}
    //   width={'80%'}
    //   //size={"small"}
    // >
    //   <div>
    //     {data?.json ? (
    //       <div
    //       // className={"px-10 py-5 mb-2 border rounded-md"}
    //       // style={{ background: "#eaa45a" }}
    //       >
    //         {/* <p>{data.json.title}</p> */}
    //         <SchemaTreeEditor
    //           properties={properties}
    //           schemaData={schemaData}
    //           uiSchemaData={uiSchemaData}
    //           schemaBuilder={schemaBuilder}
    //           setSchemaBuider={setSchemaBuider}
    //           definitionData={schemaData?.definitions}
    //           definitionUi={uiSchemaData?.definitions}
    //           categoryHash={categoryHash}
    //           allFormInputs={allFormInputs}
    //           fields={fields}
    //           type={type}
    //           onChange={onChange}
    //           setIsDrawerOpen={setIsDrawerOpen}
    //         />
    //         {/* <AddItem
    //           fields={fields}
    //           type="posttype"
    //           addElem={(choice, type) => {
    //             if (choice === "card")
    //               addSelectCardObj(
    //                 {
    //                   ...properties,
    //                 },
    //                 type
    //               );
    //             else
    //               addSectionObj({
    //                 ...properties,
    //               });
    //           }}
    //           path="root"
    //         /> */}
    //       </div>
    //     ) : null}
    //   </div>
    // </Drawer>
  );
};
export default SchemaBuilder;
