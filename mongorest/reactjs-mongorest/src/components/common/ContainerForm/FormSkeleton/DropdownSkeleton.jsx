export default function DropdownSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center" style={{height: '22px'}}>
        <div
          className="rounded-md bg-slate-200 ml-2.5 animate-pulse"
          style={{
            height: '17px',
            width: '55.25px',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }}
        />
      </div>
      {[...Array(8).keys()].map(item => (
        <div
          key={item}
          className="flex gap-2 items-center h-8 rounded-md"
          style={{padding: '5px 12px'}}>
          <div
            className="rounded-md h-4 w-4 bg-slate-200 animate-pulse"
            style={{backgroundColor: 'rgba(0, 0, 0, 0.04)', minWidth: '16px'}}
          />
          <div
            className="rounded-md w-52 bg-slate-200 animate-pulse"
            style={{height: '17px', backgroundColor: 'rgba(0, 0, 0, 0.04)'}}
          />
        </div>
      ))}
    </div>
  );
}
