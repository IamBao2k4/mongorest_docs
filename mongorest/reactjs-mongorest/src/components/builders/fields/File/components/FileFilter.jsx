import { RadioEdit } from "../../Radio/components";


const FileFilter = ({ onChange }) => {
  return (
    <RadioEdit
      isFilter={true}
      onChange={onChange}
      schema={{
        type: 'string',
        widget: 'radio',
        choices: [
          {
            key: 'Yes',
            value: true,
          },
          {
            key: 'No',
            value: false,
          },
        ],
        default: true,
        layout: 1,
      }}
    />
  );
};
export default FileFilter;
