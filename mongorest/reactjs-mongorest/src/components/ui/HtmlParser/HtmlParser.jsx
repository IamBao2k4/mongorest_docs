import clsx from 'clsx';

export default function HtmlParser({ className, data, isCheckHyperLink = false, ...props }) {
  if (!data) return <></>;

  return (
    <div
      className={clsx(
        'prose prose-a:font-bold prose-a:text-yellowText prose-a:no-underline prose-ul:list-disc prose-ul:text-justify prose-li:list-inside',
        className
      )}
      {...props}
      dangerouslySetInnerHTML={{
        __html: data,
      }}
    />
  );
}
