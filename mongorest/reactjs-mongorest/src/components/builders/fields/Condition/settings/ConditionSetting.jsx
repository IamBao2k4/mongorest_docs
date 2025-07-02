import WrapperSetting from '@/components/builders/elements/WrapperSetting';

export default function ConditionSetting({ parameters, onChange }) {
  return (
    <div className='grid grid-cols-2 gap-5'>
      <WrapperSetting
        title={'Field Relation'}
        typeField={'input'}
        value={parameters?.fieldRelation}
        onChange={(val) => {
          onChange({ ...parameters, fieldRelation: val.target.value });
        }}
      />
      <WrapperSetting
        title={'Type'}
        value={parameters?.typeUI}
        optionsLevel1={[
          { value: 'filter', label: 'Filter' },
          { value: 'validate', label: 'Validate' },
        ]}
        onChange={(val) => {
          onChange({ ...parameters, typeUI: val });
        }}
      />
    </div>
  );
}
