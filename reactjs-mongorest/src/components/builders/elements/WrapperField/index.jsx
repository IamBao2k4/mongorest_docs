function WrapperField({ showLabel = true, title, required, description, error, children }) {
  return (
    <div className='w-full'>
      {showLabel && (title || description) ? (
        <div className='mb-2 text-left'>
          <p className={`font-bold mb-0`}>
            {required && <span className='text-red-600'>* </span>}
            <span className='formLabel text-black/80'>{title}</span>
          </p>
          {description && <p className='mb-0 text-xs text-[#727272]'>{description}</p>}
        </div>
      ) : null}

      {children}

      {error ? <p className='text-red-600 mb-0 text-sm'>{error}</p> : null}
    </div>
  );
}

export default WrapperField;
