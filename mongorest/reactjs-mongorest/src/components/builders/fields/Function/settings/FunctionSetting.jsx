import { RelationEdit } from '../../Relation/components';

function FunctionSetting({ parameters, onChange }) {
  return (
    <div>
      <RelationEdit
        schema={{
          title: 'Function in Backend',
          description: 'Chọn function để run ở phía backend',
          typeSelect: 'once',
          typeRelation: {
            title: 'function',
            entity: 'function',
          },
        }}
        value={parameters?.code || []}
        onChange={(data) => {
          onChange({
            ...parameters,
            code: data?.[0],
          });
        }}
      />
    </div>
  );
}
export default FunctionSetting;
