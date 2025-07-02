const DraggableSection = () => {
  return (
    <div className='section-box mb-2'>
      <p className='sj text-sm font-medium mb-2'>Section</p>
      <div
        className='btn-item w-fit text-xs p-2 cursor-pointer'
        style={{
          backgroundColor: 'rgba(72,126,176, 0.2)',
          color: 'rgb(72,126,176)',
          fontWeight: '600',
          borderRadius: '5px',
        }}>
        Add Section
      </div>
    </div>
  );
};

export default DraggableSection;
