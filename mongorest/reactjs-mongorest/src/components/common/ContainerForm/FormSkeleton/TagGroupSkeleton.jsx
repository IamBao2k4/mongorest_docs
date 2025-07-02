export default function TagGroupSkeleton() {
  return (
    <div className="rounded-md bg-white p-6">
      <div
        className="h-6  mb-2.5 bg-neutral-200 animate-pulse rounded-md"
        style={{width: '90px'}}
      />
      <div
        className="h-6 w-40 mb-2.5 bg-neutral-200 animate-pulse rounded-md"
        style={{height: '15px'}}
      />
      <div className="pl-3 flex flex-col gap-2 mb-8">
        <div className={`rounded-md bg-neutral-300 w-24 h-7 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-3 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-full h-7 animate-pulse`} />
      </div>
      <div className="pl-3 flex flex-col gap-2">
        <div className={`rounded-md bg-neutral-300 w-24 h-7 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-3 animate-pulse`} />
        <div
          className={`rounded-md bg-neutral-300 h-7 animate-pulse mb-3.5`}
          style={{width: '45px'}}
        />
      </div>
    </div>
  );
}
