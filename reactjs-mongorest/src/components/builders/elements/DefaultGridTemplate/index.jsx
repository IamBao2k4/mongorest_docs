import clsx from 'clsx';

export default function DefaultGridTemplate({ column, className, children, ...props }) {
  return (
    <div
      className={clsx(className)}
      {...props}>
      {children}
    </div>
  );
}
