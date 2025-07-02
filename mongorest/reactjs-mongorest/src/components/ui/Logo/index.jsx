export function Logo({ width = 284, height = 80, className }) {
  return (
    <img
      src={'/images/logo-mangoads.png'}
      width={width}
      height={height}
      alt='logo'
      className={className}
    />
  );
}
