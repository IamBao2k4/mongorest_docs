export default function FilterSkeleton() {
  return (
    <div
      className="rounded-md bg-white max-w-full h-96 p-6  flex animate-pulse mb-6 flex-col"
      style={{height: '421px'}}>
      <div className="flex flex-row gap-2 px-5 py-2.5 self-end mb-2.5">
        <div
          className="rounded-md bg-neutral-300 h-8 animate-pulse"
          style={{width: '102.23px'}}
        />
        <div
          className="rounded-md bg-neutral-300 h-8 animate-pulse"
          style={{width: '77.27px'}}
        />
        <div
          className="rounded-md bg-neutral-300 h-8 animate-pulse"
          style={{width: '196px'}}
        />
      </div>
      <div
        className="bg-neutral-300 w-full animate-pulse"
        style={{height: '77.0486px'}}
      />
    </div>
  );
}
