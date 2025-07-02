import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const arraySettings = [
  {
    title: 'Minimum Items',
    typeField: 'number',
    key: 'minItems',
  },
  {
    title: 'Maximum Items',
    typeField: 'number',
    key: 'maxItems',
  },
];

export default function ArraySetting({ parameters, onChange }) {
  return (
    // <div>
    //   <div className='card-entry-row'>
    //     <div className='card-entry'>
    //       <div style={{ textAlign: 'left', marginBottom: '15px' }}>
    //         <h5
    //           style={{
    //             fontSize: '14px',
    //             fontWeight: 'bold',
    //             lineHeight: '21px',
    //           }}>
    //           Minimum Items
    //         </h5>
    //         <span style={{ fontSize: '12px' }}>Minimum Items</span>
    //       </div>
    //       <Input
    //         value={parameters.minItems || ''}
    //         placeholder='ex: 2'
    //         key='minimum'
    //         type='number'
    //         onChange={(ev) => {
    //           onChange({
    //             ...parameters,
    //             minItems: parseInt(ev.target.value, 10),
    //           });
    //         }}
    //         style={{ width: '100%', height: '100%', borderRadius: 0 }}
    //       />
    //     </div>

    //     <div className='card-entry'>
    //       <div style={{ textAlign: 'left', marginBottom: '15px' }}>
    //         <h5
    //           style={{
    //             fontSize: '14px',
    //             fontWeight: 'bold',
    //             lineHeight: '21px',
    //           }}>
    //           Maximum Items
    //         </h5>
    //         <span style={{ fontSize: '12px' }}>Maximum Items</span>
    //       </div>
    //       <Input
    //         value={parameters.maxItems || ''}
    //         placeholder='ex: 2'
    //         key='maximum'
    //         type='number'
    //         onChange={(ev) => {
    //           onChange({
    //             ...parameters,
    //             maxItems: parseInt(ev.target.value, 10),
    //           });
    //         }}
    //         style={{ width: '100%', height: '100%', borderRadius: 0 }}
    //       />
    //     </div>
    //   </div>
    // </div>
    <div className='grid grid-cols-2 gap-5'>
      {arraySettings.map((item, index) => (
        <div
          key={index}
          className='col-span-1'>
          <WrapperSetting
            title={item.title}
            typeField={item.typeField}
            value={parameters[`${item.key}`]}
            onChange={(val) => {
              onChange({ ...parameters, [item.key]: parseInt(val.target.value, 10) });
            }}
          />
        </div>
      ))}
    </div>
  );
}
