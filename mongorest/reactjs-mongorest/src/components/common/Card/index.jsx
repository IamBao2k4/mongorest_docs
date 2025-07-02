import clsx from 'clsx';

function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-clip-border text-left relative p-6 bg-white border shadow-md',
        className
      )}>
      {children}
    </div>
  );
}

export default Card;
