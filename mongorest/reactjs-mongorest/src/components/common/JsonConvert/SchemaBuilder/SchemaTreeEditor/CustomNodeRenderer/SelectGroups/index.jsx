import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const SelectGroups = ({ groups, node, handleChangeData, allFormInputs }) => {
  function findDisplayNameByWidget(data, widget) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (
          data[key]?.defaultDataSchema?.widget === widget ||
          data[key]?.defaultUiSchema?.['ui:widget'] === widget
        ) {
          return data[key].displayName;
        }
      }
    }
    return null;
  }

  const displayName = findDisplayNameByWidget(allFormInputs, node.widget);

  const transformGroupsToOptions = (groups) => {
    return groups.map((group) => ({
      label: group.label,
      title: group.label,
      options: group.options.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    }));
  };
  const options = transformGroupsToOptions(groups);

  return (
    <div className='w-full'>
      <Select
        onValueChange={(value) => {
          handleChangeData(value, 'widget');
        }}
        className='w-container'>
        <SelectTrigger className='w-container'>
          <SelectValue placeholder={`${displayName}`} />
        </SelectTrigger>
        <SelectContent className='custom-select-content'>
          {options?.map((item) => {
            return (
              <SelectGroup key={item.label}>
                <SelectLabel>{item.label}</SelectLabel>
                {item.options?.map((opt) => {
                  return (
                    <SelectItem
                      key={opt?.value}
                      className='px-5 custom-select-item'
                      value={opt?.value}>
                      {opt.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
      <style>
        {`
          .w-container{
            width: 100%;
            padding: 0px;
            border: 0px !important;
            
          }
          .custom-select-content{
            width: 100%;
            padding: 0px;
            margin: 0px;
            padding: 0px;
          }
          
          .custom-select-item {
            width: 100%;
            padding: 5px; 
          }
          .shadow-sm{
            --tw-shadow: 0px;
            --tw-shadow-colored: none;
            box-shadow: 0px !important;
          }
        `}
      </style>
    </div>
  );
};

// <Select
// defaultValue={`${displayName}`}
// style={{
//   ...nodeStyle,
//   width: "10%",
//   minWidth: "100px",
//   outline: "none",
//   padding: "0px",
// }}
// onChange={(value) => {
//   console.log("value:", value);
//   handleChangeData(value, "widget");
// }}
// options={transformGroupsToOptions(groups)}
// />
// <style>
// {`
//   .ant-select-selector{
//     border: none !important;
//     background: none !important;
//     padding: 0px !important;
//   }

//   .ant-select-focused .ant-select-selector,.ant-select-selector:focus,.ant-select-selector:active,.ant-select-open .ant-select-selector {
//     border-color: none !important;
//     box-shadow: none !important;
//   }

//   .custom-select .ant-select-selector{
//     display: flex;
//     align-item: center;
//   }

// `}
// </style>

export default SelectGroups;
