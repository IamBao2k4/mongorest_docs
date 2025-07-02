export default function TabSkeleton() {
  return (
    <div className="bg-white rounded-md p-6" style={{height: '157px'}}>
      <div
        className="bg-neutral-200 rounded-md w-32 mb-6 animate-pulse"
        style={{height: '18px'}}
      />
      <div className="p-6 flex gap-5 items-center justify-center animate-pulse">
        <div
          className="h-8 bg-neutral-200 rounded-md animate-pulse"
          style={{width: '114.27px'}}
        />
        <div
          className="h-8 bg-neutral-200 rounded-md animate-pulse"
          style={{width: '114.27px'}}
        />
      </div>
    </div>
  );
}
