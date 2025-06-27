const DraggableElement = ({ groups }) => {
  return (
    <div className='fields-box'>
      <p className='sj text-sm font-medium mb-2'>Fields</p>
      {groups.map((item, idx) => {
        return (
          <div className='option-box mb-1'>
            {/* <p className="label mb-1" style={{ fontSize: "13px" }}>
            {item.label}
          </p> */}
            <div className='option-box flex flex-wrap'>
              {item.options.map((option, idx) => {
                return (
                  <div
                    key={idx}
                    className='btn-item w-fit text-xs p-2 cursor-pointer mr-1 mb-1'
                    style={{
                      backgroundColor: 'rgba(61, 172, 120, 0.2)',
                      color: 'rgb(61, 172, 120)',
                      fontWeight: '600',
                      borderRadius: '5px',
                    }}>
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DraggableElement;
