function Locale() {
  const getLocaleFromPath = () => {
    const path = window.location.pathname.split('/');
    return path[2] || 'en';
  };

  const locale = getLocaleFromPath();

  const onClick = () => {
    let newPath;
    if (locale === 'vi') {
      newPath = `/en${window.location.pathname.substring(8)}`;
    } else {
      newPath = `${window.location.pathname.substring(6)}`;
    }
    window.location.href = newPath;
  };

  return (
    <div
      className='px-4 cursor-pointer'
      onClick={onClick}>
      <img
        src={`/images/${locale}.png`}
        alt='icon'
        width={24}
        height={24}
        style={{ marginRight: 5 }}
      />
    </div>
  );
}

export default Locale;
