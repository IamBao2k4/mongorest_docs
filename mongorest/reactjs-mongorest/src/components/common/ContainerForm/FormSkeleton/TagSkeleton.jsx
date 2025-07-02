export default function TagSkeleton() {
  return (
    <div className="p-6 w-full bg-white rounded-md flex flex-col gap-4 animate-pulse mb-6 pb-12">
      <div className={`rounded-md bg-neutral-300 w-24 h-8 animate-pulse`} />
      <div className={`rounded-md bg-neutral-300 w-24 h-4 animate-pulse`} />
      <div className="pl-3 flex flex-col gap-2">
        <div className={`rounded-md bg-neutral-300 w-24 h-7 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-3 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-4 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-full h-7 animate-pulse`} />
      </div>
      <div className="pl-3 flex flex-col gap-2">
        <div className={`rounded-md bg-neutral-300 w-24 h-7 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-3 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-24 h-4 animate-pulse`} />
        <div className={`rounded-md bg-neutral-300 w-full h-7 animate-pulse`} />
      </div>
    </div>
  );
}
